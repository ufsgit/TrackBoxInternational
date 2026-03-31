# PM2 + Nginx Deployment Guide

## Prerequisites
- Nginx already running
- PM2 installed on the server
- Node.js and npm installed
- MySQL database running

## Deployment Steps

### 1. Clone and Setup Application
```bash
cd /var/www/rackbox-backend
git clone <your-repo-url> .

# Install dependencies
npm install --production

# Setup environment
cp .env.production .env
# Edit .env with your actual configuration
nano .env
```

### 2. Start with PM2
```bash
# Copy ecosystem config
cp ecosystem.config.js /var/www/rackbox-backend/

# Start the application in production mode
cd /var/www/rackbox-backend
pm2 start ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Ensure PM2 starts on server reboot
pm2 startup systemd -u username --hp /home/username
# Run the generated command output
```

### 3. Verify Nginx Configuration
Your Nginx config should already be pointing to `http://localhost:3000`. If not:

```bash
# Check your Nginx config
sudo cat /etc/nginx/sites-available/rackbox-backend

# Should contain:
# proxy_pass http://localhost:3000;

# Test Nginx
sudo nginx -t

# Restart Nginx if needed
sudo systemctl restart nginx
```

## PM2 Management

### View Running Processes
```bash
pm2 list
```

### View Real-time Logs
```bash
# All applications
pm2 logs

# Specific application
pm2 logs rackbox-backend

# Last 100 lines
pm2 logs rackbox-backend --lines 100

# Clear logs
pm2 flush
```

### Restart Application
```bash
# Restart specific app
pm2 restart rackbox-backend

# Restart all apps
pm2 restart all

# Graceful restart (0-downtime for cluster mode)
pm2 gracefulRestart rackbox-backend
```

### Stop/Delete Application
```bash
# Stop
pm2 stop rackbox-backend

# Delete
pm2 delete rackbox-backend
```

### Monitor Resource Usage
```bash
pm2 monit
```

### View Process Details
```bash
pm2 describe rackbox-backend
```

## Update Application

```bash
cd /var/www/rackbox-backend
git pull origin main
npm install --production

# Graceful restart (keeps requests alive during restart)
pm2 gracefulRestart rackbox-backend

# Or regular restart
pm2 restart rackbox-backend
```

## PM2 Plus (Optional - for monitoring dashboard)

```bash
# Link to PM2 Plus
pm2 link

# Monitor online
pm2 web  # Opens at http://localhost:9615
```

## Troubleshooting

### Check if PM2 daemon is running
```bash
pm2 status
```

### Kill all PM2 processes and restart
```bash
pm2 kill
pm2 start ecosystem.config.js --env production
pm2 save
```

### Check application logs for errors
```bash
pm2 logs rackbox-backend
```

### Verify Nginx is forwarding to Node.js correctly
```bash
# Check localhost:3000 directly
curl http://localhost:3000

# Check through Nginx
curl http://localhost or curl http://your_domain.com
```

## Important Notes

1. **Cluster Mode**: The ecosystem config uses `exec_mode: 'cluster'` to run multiple instances for better CPU utilization
2. **Memory Limit**: Set to 500MB - adjust if needed based on your app's memory usage
3. **Auto-restart**: Configured with 10 max restarts and 10s minimum uptime
4. **Zero-downtime Deploy**: Use `pm2 gracefulRestart` for smooth updates
5. **Logs**: Check `/var/log/rackbox-backend/` for persistent logs
