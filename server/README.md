# Discord Comments API Server

This server enables Discord integration for comments on your Docusaurus documentation site. Comments posted on your website sync to a Discord channel, and replies from Discord users sync back to the website.

## Features

- ✅ Post comments from website to Discord
- ✅ Sync Discord replies back to website  
- ✅ Thread support for organized discussions
- ✅ Moderation capabilities
- ✅ SQLite database for comment storage
- ✅ Configurable context levels

## Prerequisites

- Node.js 16+ installed
- A Discord server where you have admin permissions
- Discord bot token (see setup below)

## Discord Bot Setup

### 1. Create Discord Application & Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it (e.g., "Documentation Bot")
3. Go to "Bot" section and click "Add Bot"
4. Copy the bot token (you'll need this for `.env`)
5. Enable these bot permissions:
   - Send Messages
   - Read Message History
   - Create Public Threads
   - Send Messages in Threads
   - Manage Threads

### 2. Add Bot to Your Server

1. Go to "OAuth2 > URL Generator" in Discord Developer Portal
2. Select scopes: `bot`
3. Select bot permissions (as listed above)
4. Use generated URL to invite bot to your server

### 3. Get Channel ID

1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click the channel where you want comments posted
3. Select "Copy ID"

## Installation & Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your Discord configuration:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CHANNEL_ID=your_channel_id_here

# API Configuration  
PORT=3001

# Database Configuration (optional)
# If not set, will try current directory, then fallback to /tmp
# DATABASE_PATH=/path/to/your/comments.db

# Discord Context Configuration
DISCORD_CONTEXT_LEVEL=full
DISCORD_CREATE_THREADS=true
DISCORD_THREAD_DURATION=1440
DISCORD_SITE_NAME=Your Documentation Site
```

### 3. Development Mode

For testing and development:

```bash
npm run dev
```

The server will start on `http://localhost:3001` and auto-restart on file changes.

### 4. Production Setup

#### Option A: Direct Node.js

```bash
npm start
```

#### Option B: Systemd Service (Recommended)

1. **Create writable database directory**:
```bash
sudo mkdir -p /var/lib/discord-comments
sudo chown your-service-user:your-service-user /var/lib/discord-comments
```

2. **Update service file paths**:
```bash
# Edit the service file to match your installation path
sudo nano discord-comments.service
```

3. **Update .env for production**:
```bash
# Add to your .env file
DATABASE_PATH=/var/lib/discord-comments/comments.db
```

4. **Install service**:
```bash
sudo cp discord-comments.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable discord-comments
sudo systemctl start discord-comments
```

5. **Check service status**:
```bash
sudo systemctl status discord-comments
```

#### Option C: Docker (Easy Deployment)

For containerized deployment with persistent database:

```bash
# Copy environment file
cp .env.example .env
# Edit .env with your Discord configuration

# Start with Docker Compose (recommended)
docker-compose up -d

# Or build and run manually
docker build -t discord-comments .
docker run -d \
  --name discord-comments \
  -p 3001:3001 \
  -v discord_comments_data:/app/data \
  --env-file .env \
  discord-comments
```

Check container logs:
```bash
docker logs discord-comments -f
```

## Nginx Integration

Add this to your nginx site configuration to proxy API requests:

```nginx
# Add before the main location / block
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $http_host;
    proxy_set_header Connection "";
    proxy_buffering off;
}
```

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Configuration Options

### Context Levels

- **minimal**: Just page title and URL
- **basic**: Title, URL, and basic page info  
- **full**: Complete context with breadcrumbs and section info
- **custom**: Use individual DISCORD_SHOW_* settings

### Thread Settings

- `DISCORD_CREATE_THREADS`: Create threads for each comment
- `DISCORD_THREAD_DURATION`: Thread auto-archive time (minutes)
- `DISCORD_SITE_NAME`: Display name for your site

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/comments/:pageUrl` - Get comments for a page
- `POST /api/comments` - Send new comment to Discord
- `POST /api/replies` - Reply to a comment
- `POST /api/auth/mod` - Moderator authentication
- `DELETE /api/comments/:id` - Delete comment (mod only)

## Troubleshooting

### Bot Not Responding

1. Check bot token is correct in `.env`
2. Verify bot has required permissions
3. Check server logs: `sudo journalctl -u discord-comments -f`

### CSP Errors

If you see Content Security Policy errors, ensure you're using the nginx proxy instead of direct localhost connections.

### Database Issues

The SQLite database location is determined automatically:

1. **Custom path**: Set `DATABASE_PATH` environment variable
2. **Development**: Uses `server/comments.db` if directory is writable
3. **Production**: Falls back to `/tmp/discord-comments/comments.db` for read-only deployments

**Database Location Debug:**
Check server logs on startup to see which path is being used:
```bash
sudo journalctl -u discord-comments -f | grep "Using database path"
```

**Reset Database:**
```bash
# Find current database location from logs, then:
rm /path/to/comments.db
# Restart the server to recreate
sudo systemctl restart discord-comments
```

### "SQLITE_READONLY" Error

If you see "attempt to write a readonly database" errors:

1. **Quick Fix**: The server will automatically detect this and fallback to `/tmp`
2. **Persistent Fix**: Set `DATABASE_PATH` to a writable location:
   ```bash
   # In your .env file
   DATABASE_PATH=/var/lib/discord-comments/comments.db
   
   # Create the directory with proper permissions
   sudo mkdir -p /var/lib/discord-comments
   sudo chown your-service-user:your-service-user /var/lib/discord-comments
   ```

## Logs

View service logs:
```bash
sudo journalctl -u discord-comments -f
```

## Security Notes

- The moderation password is set in `.env` as `MOD_PASSWORD`
- API tokens are stored in session storage (client-side)
- Use HTTPS in production
- Regularly update dependencies

## Support

For issues or questions about the Discord integration, check the troubleshooting documentation or create an issue in the repository.
