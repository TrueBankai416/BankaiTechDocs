const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database setup with fallback for read-only environments
function getWritableDatabasePath() {
  // Check if DATABASE_PATH is set in environment
  if (process.env.DATABASE_PATH) {
    const customPath = process.env.DATABASE_PATH;
    const dir = path.dirname(customPath);
    
    // Ensure directory exists
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return customPath;
    } catch (error) {
      console.warn(`Could not use custom DATABASE_PATH ${customPath}:`, error.message);
    }
  }
  
  // Try current directory first
  const localPath = path.join(__dirname, 'comments.db');
  try {
    // Test if we can write to current directory
    const testFile = path.join(__dirname, '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return localPath;
  } catch (error) {
    console.warn(`Cannot write to current directory (${__dirname}), falling back to /tmp:`, error.message);
  }
  
  // Fallback to /tmp directory
  const tmpPath = path.join('/tmp', 'discord-comments', 'comments.db');
  const tmpDir = path.dirname(tmpPath);
  
  try {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return tmpPath;
  } catch (error) {
    console.error('Could not create database directory in /tmp:', error);
    // Final fallback - try current directory anyway
    return localPath;
  }
}

const dbPath = getWritableDatabasePath();
console.log(`Using database path: ${dbPath}`);
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
  
  // Add thread status and tags columns
  db.run(`ALTER TABLE comments ADD COLUMN thread_deleted BOOLEAN DEFAULT FALSE`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding thread_deleted column:', err);
    }
  });
  
  db.run(`ALTER TABLE comments ADD COLUMN thread_tags TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding thread_tags column:', err);
    }
  });
  
  // Add problem summary column
  db.run(`ALTER TABLE comments ADD COLUMN problem_summary TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding problem_summary column:', err);
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
  storeComment: (pageUrl, pageTitle, authorName, content, discordMessageId, discordChannelId, discordThreadId = null, problemSummary = null) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO comments (page_url, page_title, author_name, content, discord_message_id, discord_channel_id, discord_thread_id, problem_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([pageUrl, pageTitle, authorName, content, discordMessageId, discordChannelId, discordThreadId, problemSummary], function(err) {
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
          c.id, c.page_url, c.page_title, c.author_name, c.content, c.discord_message_id, c.discord_channel_id,
          c.discord_thread_id, c.thread_deleted, c.thread_tags, c.problem_summary, c.created_at,
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
        WHERE c.page_url = ? AND c.thread_deleted = FALSE
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
                discord_thread_id: row.discord_thread_id,
                thread_deleted: row.thread_deleted,
                thread_tags: row.thread_tags,
                problem_summary: row.problem_summary,
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
        WHERE author_name = ? AND page_url = ? AND discord_thread_id IS NOT NULL AND thread_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT 1
      `, [authorName, pageUrl], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.discord_thread_id : null);
      });
    });
  },

  // Update thread status
  updateThreadStatus: (threadId, isDeleted, tags = null) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        UPDATE comments 
        SET thread_deleted = ?, thread_tags = ?
        WHERE discord_thread_id = ?
      `);
      
      stmt.run([isDeleted, tags, threadId], function(err) {
        if (err) {
          console.error('Error updating thread status:', err);
          reject(err);
        } else {
          console.log(`Updated ${this.changes} comments for thread ${threadId}, deleted: ${isDeleted}, tags: ${tags}`);
          resolve(this.changes);
        }
      });
      
      stmt.finalize();
    });
  },

  // Get all active threads for monitoring
  getActiveThreads: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT DISTINCT discord_thread_id, discord_channel_id
        FROM comments 
        WHERE discord_thread_id IS NOT NULL AND thread_deleted = FALSE
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Delete a comment
  deleteComment: (commentId) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        DELETE FROM comments WHERE id = ?
      `);
      
      stmt.run([commentId], function(err) {
        if (err) reject(err);
        else resolve(this.changes > 0);
      });
      
      stmt.finalize();
    });
  }
};

module.exports = dbFunctions;
