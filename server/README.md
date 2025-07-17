# Discord Comments Server

Backend server for bidirectional Discord comments integration with Docusaurus.

## Features

- **Discord Bot Integration**: Full Discord bot with message listening
- **Bidirectional Communication**: Website comments → Discord, Discord replies → Website
- **Database Storage**: SQLite database for comment/reply relationships
- **REST API**: Express.js API for frontend communication
- **Real-time Updates**: Automatic polling and thread management

## Setup

### 1. Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent (optional)

### 2. Bot Permissions

Your bot needs these permissions:
- Read Messages
- Send Messages
- Create Public Threads
- Send Messages in Threads
- Read Message History
- Use Slash Commands (optional)

### 3. Invite Bot to Server

1. Go to OAuth2 > URL Generator
2. Select "bot" scope
3. Select the permissions listed above
4. Use the generated URL to invite the bot to your server

### 4. Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here
PORT=3001
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### POST `/api/comments`
Send a new comment to Discord

**Body:**
```json
{
  "pageUrl": "https://example.com/page",
  "pageTitle": "Page Title",
  "authorName": "John Doe",
  "content": "Comment content"
}
```

### GET `/api/comments/:pageUrl`
Get comments and replies for a specific page

**Response:**
```json
{
  "success": true,
  "comments": [
    {
      "id": 1,
      "author_name": "John Doe",
      "content": "Original comment",
      "created_at": "2023-01-01T12:00:00Z",
      "replies": [
        {
          "id": 1,
          "discord_username": "discord_user",
          "discord_avatar": "https://cdn.discordapp.com/...",
          "content": "Discord reply",
          "created_at": "2023-01-01T12:05:00Z"
        }
      ]
    }
  ]
}
```

### GET `/api/health`
Health check endpoint

## How It Works

1. **Website Comment**: User submits comment via website form
2. **Discord Message**: Bot sends formatted embed to Discord channel
3. **Thread Creation**: Bot creates a thread for organized replies
4. **Discord Replies**: Users reply in Discord thread or to the message
5. **Database Storage**: Bot stores replies in SQLite database
6. **Website Display**: Frontend polls API and displays Discord replies

## Database Schema

### Comments Table
```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_url TEXT NOT NULL,
  page_title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  discord_message_id TEXT UNIQUE,
  discord_channel_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Replies Table
```sql
CREATE TABLE replies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  discord_message_id TEXT UNIQUE,
  discord_user_id TEXT NOT NULL,
  discord_username TEXT NOT NULL,
  discord_avatar TEXT,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES comments (id)
);
```

## Deployment

### Production Considerations

1. **Database**: Consider using PostgreSQL for production
2. **Environment**: Set proper environment variables
3. **Process Management**: Use PM2 or similar for process management
4. **Security**: Implement rate limiting and input validation
5. **Monitoring**: Add logging and monitoring

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Troubleshooting

### Bot Not Responding
- Check bot token is correct
- Verify bot has necessary permissions
- Check channel ID is correct
- Ensure bot is in the server

### Database Issues
- Check file permissions for SQLite database
- Verify database path is accessible
- Check for disk space issues

### API Connection Issues
- Verify server is running on correct port
- Check CORS configuration
- Verify API URL in frontend configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License
