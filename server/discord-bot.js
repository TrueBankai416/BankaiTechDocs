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

      // Store the reply
      await db.storeReply(
        commentId,
        message.id,
        message.author.id,
        message.author.username,
        message.author.displayAvatarURL(),
        message.content
      );

      console.log(`Stored reply from ${message.author.username} for comment ${commentId}`);
    } catch (error) {
      console.error('Error storing reply:', error);
    }
  }

  buildEmbed(pageUrl, pageTitle, authorName, content) {
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
      embed.setTitle(pageTitle);
      return embed;
    }

    if (contextLevel === 'basic') {
      embed.setTitle(`💬 ${pageTitle}`)
        .setURL(pageUrl);
      return embed;
    }

    // Full context (default) or custom
    if (contextLevel === 'full' || contextLevel === 'custom') {
      embed.setTitle(`💬 New Comment: ${pageTitle}`)
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

  async sendComment(pageUrl, pageTitle, authorName, content) {
    try {
      if (!this.client.isReady()) {
        throw new Error('Discord bot is not ready');
      }

      const channel = await this.client.channels.fetch(this.channelId);
      if (!channel) {
        throw new Error('Discord channel not found');
      }

      const embed = this.buildEmbed(pageUrl, pageTitle, authorName, content);
      const message = await channel.send({ embeds: [embed] });

      // Store in database
      await db.storeComment(
        pageUrl,
        pageTitle,
        authorName,
        content,
        message.id,
        this.channelId
      );

      // Create a thread for replies (if not minimal context)
      const contextLevel = process.env.DISCORD_CONTEXT_LEVEL || 'full';
      const createThreads = process.env.DISCORD_CREATE_THREADS !== 'false';
      
      if (contextLevel !== 'minimal' && createThreads) {
        const threadName = pageTitle.length > 50 
          ? `💬 ${pageTitle.substring(0, 47)}...`
          : `💬 ${pageTitle}`;
          
        await message.startThread({
          name: threadName,
          autoArchiveDuration: parseInt(process.env.DISCORD_THREAD_DURATION || '1440') // 24 hours default
        });
      }

      return message.id;
    } catch (error) {
      console.error('Error sending comment to Discord:', error);
      throw error;
    }
  }

  async start() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN environment variable is required');
    }

    await this.client.login(token);
  }

  async stop() {
    if (this.client.isReady()) {
      await this.client.destroy();
    }
  }
}

module.exports = DiscordBot;
