const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'comments.db');
const db = new sqlite3.Database(dbPath);

// Initialize database schema
db.serialize(() => {
  // Comments table - stores original website comments
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_url TEXT NOT NULL,
      page_title TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      discord_message_id TEXT UNIQUE,
      discord_channel_id TEXT,
      discord_thread_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add discord_thread_id column to existing tables if it doesn't exist
  db.run(`ALTER TABLE comments ADD COLUMN discord_thread_id TEXT`, (err) => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding discord_thread_id column:', err);
    }
  });

  // Replies table - stores Discord replies to comments
  db.run(`
    CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL,
      discord_message_id TEXT UNIQUE,
      discord_user_id TEXT NOT NULL,
      discord_username TEXT NOT NULL,
      discord_avatar TEXT,
      discord_roles TEXT,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (comment_id) REFERENCES comments (id)
    )
  `);
  
  // Add discord_roles column to existing tables if it doesn't exist
  db.run(`ALTER TABLE replies ADD COLUMN discord_roles TEXT`, (err) => {
    // Ignore error if column already exists
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding discord_roles column:', err);
    }
  });

  // Index for faster lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_comments_page_url ON comments(page_url)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_comments_discord_message ON comments(discord_message_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id)`);
});

// Database functions
const dbFunctions = {
  // Store a new comment
  storeComment: (pageUrl, pageTitle, authorName, content, discordMessageId, discordChannelId, discordThreadId = null) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO comments (page_url, page_title, author_name, content, discord_message_id, discord_channel_id, discord_thread_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([pageUrl, pageTitle, authorName, content, discordMessageId, discordChannelId, discordThreadId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  },

  // Store a Discord reply
  storeReply: (commentId, discordMessageId, discordUserId, discordUsername, discordAvatar, discordRoles, content) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO replies (comment_id, discord_message_id, discord_user_id, discord_username, discord_avatar, discord_roles, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([commentId, discordMessageId, discordUserId, discordUsername, discordAvatar, discordRoles, content], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      
      stmt.finalize();
    });
  },

  // Get comment by Discord message ID
  getCommentByDiscordId: (discordMessageId) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM comments WHERE discord_message_id = ?
      `, [discordMessageId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Get all comments and replies for a page
  getCommentsForPage: (pageUrl) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          c.*,
          r.id as reply_id,
          r.discord_message_id as reply_discord_id,
          r.discord_user_id,
          r.discord_username,
          r.discord_avatar,
          r.discord_roles,
          r.content as reply_content,
          r.created_at as reply_created_at
        FROM comments c
        LEFT JOIN replies r ON c.id = r.comment_id
        WHERE c.page_url = ?
        ORDER BY c.created_at DESC, r.created_at ASC
      `, [pageUrl], (err, rows) => {
        if (err) reject(err);
        else {
          // Group replies under their parent comments
          const commentsMap = new Map();
          
          rows.forEach(row => {
            if (!commentsMap.has(row.id)) {
              commentsMap.set(row.id, {
                id: row.id,
                page_url: row.page_url,
                page_title: row.page_title,
                author_name: row.author_name,
                content: row.content,
                discord_message_id: row.discord_message_id,
                discord_channel_id: row.discord_channel_id,
                created_at: row.created_at,
                replies: []
              });
            }
            
            if (row.reply_id) {
              commentsMap.get(row.id).replies.push({
                id: row.reply_id,
                discord_message_id: row.reply_discord_id,
                discord_user_id: row.discord_user_id,
                discord_username: row.discord_username,
                discord_avatar: row.discord_avatar,
                discord_roles: row.discord_roles,
                content: row.reply_content,
                created_at: row.reply_created_at
              });
            }
          });
          
          resolve(Array.from(commentsMap.values()));
        }
      });
    });
  },

  // Check if reply already exists
  replyExists: (discordMessageId) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id FROM replies WHERE discord_message_id = ?
      `, [discordMessageId], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });
  },

  // Find existing thread for author
  findThreadForAuthor: (authorName, pageUrl) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT discord_thread_id FROM comments 
        WHERE author_name = ? AND page_url = ? AND discord_thread_id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 1
      `, [authorName, pageUrl], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.discord_thread_id : null);
      });
    });
  }
};

module.exports = dbFunctions;
