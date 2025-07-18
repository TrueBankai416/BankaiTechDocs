require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const DiscordBot = require('./discord-bot');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Discord bot
const bot = new DiscordBot();

// API Routes

// POST /api/comments - Send a new comment to Discord
app.post('/api/comments', async (req, res) => {
  try {
    const { pageUrl, pageTitle, authorName, content } = req.body;

    if (!pageUrl || !pageTitle || !authorName || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: pageUrl, pageTitle, authorName, content' 
      });
    }

    const messageId = await bot.sendComment(pageUrl, pageTitle, authorName, content);
    
    res.json({ 
      success: true, 
      messageId,
      message: 'Comment sent to Discord successfully' 
    });
  } catch (error) {
    console.error('Error sending comment:', error);
    res.status(500).json({ 
      error: 'Failed to send comment to Discord',
      details: error.message 
    });
  }
});

// GET /api/comments/:pageUrl - Get comments and replies for a page
app.get('/api/comments/:pageUrl', async (req, res) => {
  try {
    const pageUrl = decodeURIComponent(req.params.pageUrl);
    const comments = await db.getCommentsForPage(pageUrl);
    
    console.log(`Fetched ${comments.length} comments for page: ${pageUrl}`);
    console.log('Comments:', comments.map(c => ({ id: c.id, deleted: c.thread_deleted, author: c.author_name })));
    
    res.json({ 
      success: true, 
      comments 
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ 
      error: 'Failed to fetch comments',
      details: error.message 
    });
  }
});

// POST /api/replies - Post a reply to a Discord message
app.post('/api/replies', async (req, res) => {
  try {
    const { discordMessageId, authorName, content } = req.body;

    if (!discordMessageId || !authorName || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: discordMessageId, authorName, content' 
      });
    }

    // Find the comment by Discord message ID
    const comment = await db.getCommentByDiscordId(discordMessageId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Send reply to Discord thread
    const channel = await bot.client.channels.fetch(comment.discord_channel_id);
    if (!channel) {
      return res.status(404).json({ error: 'Discord channel not found' });
    }

    // Find the original message
    const originalMessage = await channel.messages.fetch(discordMessageId);
    if (!originalMessage) {
      return res.status(404).json({ error: 'Original Discord message not found' });
    }

    // Check if message has a thread
    let targetChannel = channel;
    if (originalMessage.thread) {
      targetChannel = originalMessage.thread;
    }

    // Send the reply
    const replyMessage = await targetChannel.send(`**${authorName}** (from website): ${content}`);

    // Store the reply in database
    await db.storeReply(
      comment.id,
      replyMessage.id,
      'website',
      authorName,
      null, // no avatar for website users
      null, // no roles for website users
      content
    );

    res.json({ 
      success: true, 
      messageId: replyMessage.id,
      message: 'Reply sent to Discord successfully' 
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ 
      error: 'Failed to send reply to Discord',
      details: error.message 
    });
  }
});

// GET /api/health - Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    botReady: bot.client.isReady(),
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  try {
    console.log('Starting Discord bot...');
    await bot.start();
    
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
      console.log(`Discord bot connected and ready!`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await bot.stop();
  process.exit(0);
});

// Start if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, bot };
