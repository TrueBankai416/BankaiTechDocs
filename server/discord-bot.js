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

  async sendComment(pageUrl, pageTitle, authorName, content) {
    try {
      if (!this.client.isReady()) {
        throw new Error('Discord bot is not ready');
      }

      const channel = await this.client.channels.fetch(this.channelId);
      if (!channel) {
        throw new Error('Discord channel not found');
      }

      const embed = new EmbedBuilder()
        .setTitle(`💬 New Comment: ${pageTitle}`)
        .setDescription(content)
        .setColor(0x5865F2)
        .setURL(pageUrl)
        .setAuthor({ name: authorName })
        .addFields({
          name: 'Page',
          value: `[${pageTitle}](${pageUrl})`,
          inline: true
        })
        .setTimestamp();

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

      // Create a thread for replies
      await message.startThread({
        name: `💬 ${pageTitle.substring(0, 50)}...`,
        autoArchiveDuration: 1440 // 24 hours
      });

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
