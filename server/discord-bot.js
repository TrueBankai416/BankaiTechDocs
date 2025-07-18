const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const db = require('./database');

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.channelId = process.env.DISCORD_CHANNEL_ID;
    this.setupEventListeners();
    this.setupThreadMonitoring();
  }

  setupEventListeners() {
    this.client.once('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user.tag}!`);
      
      // Set bot presence to show as online
      this.client.user.setPresence({
        activities: [{ name: 'for website comments', type: 3 }], // Type 3 = "Watching"
        status: 'online'
      });
    });

    // Listen for messages in the configured channel
    this.client.on('messageCreate', async (message) => {
      // Ignore bot messages
      if (message.author.bot) return;

      // Handle mentions in any channel
      if (message.mentions.has(this.client.user)) {
        await this.handleMention(message);
        return;
      }

      // Only process messages in the configured channel
      if (message.channel.id !== this.channelId) return;

      // Check if this is a reply to a comment (in thread or replying to bot message)
      await this.handlePotentialReply(message);
    });

    // Listen for thread messages
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      // Handle thread messages
      if (message.channel.isThread()) {
        await this.handleThreadReply(message);
      }
    });
  }

  async handleMention(message) {
    try {
      const responses = [
        "👋 Hello! I'm Live Docs Bot. I help manage comments between your website and Discord!",
        "🤖 I'm working! I listen for website comments and Discord replies.",
        "✅ Bot is online and ready to handle website comments!",
        "📝 I sync comments from your documentation site to Discord channels.",
        "🔗 I create threads for website comments and track Discord replies back to the site!"
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      await message.reply(randomResponse);
    } catch (error) {
      console.error('Error handling mention:', error);
    }
  }

  async handlePotentialReply(message) {
    try {
      // Check if message is a reply to a bot message
      if (message.reference && message.reference.messageId) {
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
        
        if (referencedMessage.author.id === this.client.user.id) {
          // This is a reply to our bot message
          const comment = await db.getCommentByDiscordId(referencedMessage.id);
          
          if (comment) {
            await this.storeReply(comment.id, message);
          }
        }
      }
    } catch (error) {
      console.error('Error handling potential reply:', error);
    }
  }

  async handleThreadReply(message) {
    try {
      // Get the parent message of the thread
      const parentMessage = await message.channel.fetchStarterMessage();
      
      if (parentMessage && parentMessage.author.id === this.client.user.id) {
        const comment = await db.getCommentByDiscordId(parentMessage.id);
        
        if (comment) {
          await this.storeReply(comment.id, message);
        }
      }
    } catch (error) {
      console.error('Error handling thread reply:', error);
    }
  }

  async storeReply(commentId, message) {
    try {
      // Check if reply already exists
      const exists = await db.replyExists(message.id);
      if (exists) return;

      // Get user's Discord roles
      const member = await message.guild.members.fetch(message.author.id);
      const roles = member.roles.cache
        .filter(role => role.name !== '@everyone')
        .map(role => role.name)
        .join(', ');

      // Store the reply
      await db.storeReply(
        commentId,
        message.id,
        message.author.id,
        message.author.username,
        message.author.displayAvatarURL(),
        roles,
        message.content
      );

      console.log(`Stored reply from ${message.author.username} for comment ${commentId}`);
    } catch (error) {
      console.error('Error storing reply:', error);
    }
  }

  buildEmbed(pageUrl, pageTitle, authorName, content, problemSummary = null) {
    const contextLevel = process.env.DISCORD_CONTEXT_LEVEL || 'full';
    const showPageContext = process.env.DISCORD_SHOW_PAGE_CONTEXT !== 'false';
    const showBreadcrumbs = process.env.DISCORD_SHOW_BREADCRUMBS !== 'false';
    const showSectionInfo = process.env.DISCORD_SHOW_SECTION_INFO !== 'false';
    const showPagePath = process.env.DISCORD_SHOW_PAGE_PATH !== 'false';
    const showTimestamp = process.env.DISCORD_SHOW_TIMESTAMP !== 'false';
    const showAuthorField = process.env.DISCORD_SHOW_AUTHOR_FIELD !== 'false';
    const siteName = process.env.DISCORD_SITE_NAME || 'Documentation';

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setDescription(content);

    // Context level presets
    if (contextLevel === 'minimal') {
      embed.setTitle(problemSummary || pageTitle);
      return embed;
    }

    if (contextLevel === 'basic') {
      embed.setTitle(`💬 ${problemSummary || pageTitle}`)
        .setURL(pageUrl);
      return embed;
    }

    // Full context (default) or custom
    if (contextLevel === 'full' || contextLevel === 'custom') {
      const title = problemSummary 
        ? `💬 ${problemSummary} - ${pageTitle}`
        : `💬 New Comment: ${pageTitle}`;
      embed.setTitle(title)
        .setURL(pageUrl);

      if (showAuthorField) {
        embed.setAuthor({ name: authorName });
      }

      if (showTimestamp) {
        embed.setTimestamp();
      }

      const fields = [];

      if (showPageContext) {
        fields.push({
          name: '📄 Page',
          value: `[${pageTitle}](${pageUrl})`,
          inline: true
        });
      }

      if (showBreadcrumbs) {
        const breadcrumbs = this.extractBreadcrumbs(pageUrl);
        if (breadcrumbs) {
          fields.push({
            name: '📍 Navigation',
            value: breadcrumbs,
            inline: true
          });
        }
      }

      if (showSectionInfo) {
        const section = this.extractSection(pageUrl);
        if (section) {
          fields.push({
            name: '📂 Section',
            value: section,
            inline: true
          });
        }
      }

      if (showPagePath) {
        const path = this.extractPath(pageUrl);
        if (path) {
          fields.push({
            name: '🔗 Path',
            value: `\`${path}\``,
            inline: false
          });
        }
      }

      if (fields.length > 0) {
        embed.addFields(fields);
      }

      // Add site footer
      embed.setFooter({ text: `${siteName} • Comment System` });
    }

    return embed;
  }

  extractBreadcrumbs(pageUrl) {
    try {
      const url = new URL(pageUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      
      if (pathParts.length > 1) {
        // Convert URL parts to readable breadcrumbs
        const breadcrumbs = pathParts.map(part => 
          decodeURIComponent(part)
            .replace(/%20/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .trim()
        );
        return breadcrumbs.join(' > ');
      }
      return null;
    } catch (error) {
      console.error('Error extracting breadcrumbs:', error);
      return null;
    }
  }

  extractSection(pageUrl) {
    try {
      const url = new URL(pageUrl);
      const pathParts = url.pathname.split('/').filter(part => part);
      
      if (pathParts.length > 0) {
        // Return the first part as the main section
        return decodeURIComponent(pathParts[0])
          .replace(/%20/g, ' ')
          .replace(/([A-Z])/g, ' $1')
          .trim();
      }
      return null;
    } catch (error) {
      console.error('Error extracting section:', error);
      return null;
    }
  }

  extractPath(pageUrl) {
    try {
      const url = new URL(pageUrl);
      return url.pathname;
    } catch (error) {
      console.error('Error extracting path:', error);
      return null;
    }
  }

  async sendComment(pageUrl, pageTitle, authorName, content, problemSummary = null) {
    try {
      if (!this.client.isReady()) {
        throw new Error('Discord bot is not ready');
      }

      const channel = await this.client.channels.fetch(this.channelId);
      if (!channel) {
        throw new Error('Discord channel not found');
      }

      // Check if there's an existing thread for this author on this page
      const existingThreadId = await db.findThreadForAuthor(authorName, pageUrl);
      let targetChannel = channel;
      let message;
      let threadId = null;

      if (existingThreadId) {
        try {
          // Try to use existing thread
          const existingThread = await channel.threads.fetch(existingThreadId);
          if (existingThread && !existingThread.archived) {
            targetChannel = existingThread;
            message = await targetChannel.send(`**${authorName}**: ${content}`);
            threadId = existingThreadId;
          } else {
            // Thread is archived or doesn't exist, create new one
            const embed = this.buildEmbed(pageUrl, pageTitle, authorName, content, problemSummary);
            message = await channel.send({ embeds: [embed] });
            threadId = await this.createThread(message, authorName, problemSummary || pageTitle);
          }
        } catch (error) {
          console.error('Error accessing existing thread:', error);
          // Fall back to creating new message and thread
          const embed = this.buildEmbed(pageUrl, pageTitle, authorName, content, problemSummary);
          message = await channel.send({ embeds: [embed] });
          threadId = await this.createThread(message, authorName, problemSummary || pageTitle);
        }
      } else {
        // No existing thread, create new message and thread
        const embed = this.buildEmbed(pageUrl, pageTitle, authorName, content, problemSummary);
        message = await channel.send({ embeds: [embed] });
        threadId = await this.createThread(message, authorName, problemSummary || pageTitle);
      }

      // Store in database
      await db.storeComment(
        pageUrl,
        pageTitle,
        authorName,
        content,
        message.id,
        this.channelId,
        threadId,
        problemSummary
      );

      return message.id;
    } catch (error) {
      console.error('Error sending comment to Discord:', error);
      throw error;
    }
  }

  async createThread(message, authorName, threadTitle) {
    try {
      const contextLevel = process.env.DISCORD_CONTEXT_LEVEL || 'full';
      const createThreads = process.env.DISCORD_CREATE_THREADS !== 'false';
      
      if (contextLevel !== 'minimal' && createThreads) {
        const threadName = `💬 ${authorName} - ${threadTitle}`;
        const finalThreadName = threadName.length > 50 
          ? `💬 ${authorName} - ${threadTitle.substring(0, 47 - authorName.length)}...`
          : threadName;
          
        const thread = await message.startThread({
          name: finalThreadName,
          autoArchiveDuration: parseInt(process.env.DISCORD_THREAD_DURATION || '1440') // 24 hours default
        });
        
        return thread.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating thread:', error);
      return null;
    }
  }

  async start() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN environment variable is required');
    }

    await this.client.login(token);
  }

  setupThreadMonitoring() {
    // Check threads immediately on startup (after bot is ready)
    this.client.once('ready', async () => {
      console.log('Starting initial thread status check...');
      setTimeout(async () => {
        try {
          await this.checkThreadStatus();
        } catch (error) {
          console.error('Error in initial thread check:', error);
        }
      }, 5000); // Wait 5 seconds after bot is ready
    });

    // Monitor threads every 5 minutes
    setInterval(async () => {
      try {
        console.log('Running scheduled thread status check...');
        await this.checkThreadStatus();
      } catch (error) {
        console.error('Error monitoring threads:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  async checkThreadStatus() {
    try {
      const activeThreads = await db.getActiveThreads();
      console.log(`Checking ${activeThreads.length} active threads...`);
      
      for (const thread of activeThreads) {
        try {
          console.log(`Checking thread ${thread.discord_thread_id}...`);
          
          const channel = await this.client.channels.fetch(thread.discord_channel_id);
          if (!channel) {
            console.log(`Channel ${thread.discord_channel_id} not found`);
            continue;
          }

          // Try to fetch the thread directly
          let discordThread = null;
          try {
            discordThread = await this.client.channels.fetch(thread.discord_thread_id);
          } catch (fetchError) {
            if (fetchError.code === 10003) {
              // Thread not found (deleted)
              await db.updateThreadStatus(thread.discord_thread_id, true, null);
              console.log(`✅ Thread ${thread.discord_thread_id} was deleted - marked as deleted in database`);
              continue;
            } else {
              throw fetchError;
            }
          }
          
          if (!discordThread) {
            // Thread was deleted
            await db.updateThreadStatus(thread.discord_thread_id, true, null);
            console.log(`✅ Thread ${thread.discord_thread_id} was deleted - marked as deleted in database`);
          } else {
            // Thread exists, check for tags
            const tags = this.extractThreadTags(discordThread);
            await db.updateThreadStatus(thread.discord_thread_id, false, tags);
            console.log(`Thread ${thread.discord_thread_id} exists with tags: ${tags || 'none'}`);
          }
        } catch (error) {
          if (error.code === 10003) {
            // Thread not found (deleted)
            await db.updateThreadStatus(thread.discord_thread_id, true, null);
            console.log(`✅ Thread ${thread.discord_thread_id} was deleted - marked as deleted in database`);
          } else {
            console.error(`Error checking thread ${thread.discord_thread_id}:`, error);
          }
        }
      }
      
      console.log('Thread status check completed');
    } catch (error) {
      console.error('Error in checkThreadStatus:', error);
    }
  }

  extractThreadTags(discordThread) {
    try {
      if (!discordThread.appliedTags || discordThread.appliedTags.length === 0) {
        return null;
      }

      // Get tag names from the parent channel's available tags
      const parentChannel = discordThread.parent;
      if (!parentChannel || !parentChannel.availableTags) {
        return null;
      }

      const tagNames = discordThread.appliedTags
        .map(tagId => {
          const tag = parentChannel.availableTags.find(t => t.id === tagId);
          return tag ? tag.name : null;
        })
        .filter(Boolean);

      return tagNames.length > 0 ? tagNames.join(', ') : null;
    } catch (error) {
      console.error('Error extracting thread tags:', error);
      return null;
    }
  }

  async stop() {
    if (this.client.isReady()) {
      await this.client.destroy();
    }
  }
}

module.exports = DiscordBot;
