#!/bin/bash
# Cloudflare IP Update Script
# Run this script monthly to update Cloudflare IP ranges

set -euo pipefail

CLOUDFLARE_CONFIG="/etc/nginx/cloudflare"
BACKUP_CONFIG="/etc/nginx/cloudflare.backup"
TEMP_CONFIG="/tmp/cloudflare.new"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    log "ERROR: This script must be run as root or with sudo"
    exit 1
fi

log "Starting Cloudflare IP update..."

# Create backup of current configuration
if [[ -f "$CLOUDFLARE_CONFIG" ]]; then
    cp "$CLOUDFLARE_CONFIG" "$BACKUP_CONFIG"
    log "Backup created: $BACKUP_CONFIG"
fi

# Create new configuration file
cat > "$TEMP_CONFIG" << 'EOF'
# Cloudflare IP Ranges - Auto-updated on $(date '+%Y-%m-%d')
# IPv4 Ranges
EOF

# Fetch IPv4 ranges
log "Fetching IPv4 ranges..."
if ipv4_ranges=$(curl -s --max-time 30 https://www.cloudflare.com/ips-v4); then
    while IFS= read -r range; do
        [[ -n "$range" ]] && echo "set_real_ip_from $range;" >> "$TEMP_CONFIG"
    done <<< "$ipv4_ranges"
else
    log "ERROR: Failed to fetch IPv4 ranges"
    exit 1
fi

# Add IPv6 section
cat >> "$TEMP_CONFIG" << 'EOF'

# IPv6 Ranges  
EOF

# Fetch IPv6 ranges
log "Fetching IPv6 ranges..."
if ipv6_ranges=$(curl -s --max-time 30 https://www.cloudflare.com/ips-v6); then
    while IFS= read -r range; do
        [[ -n "$range" ]] && echo "set_real_ip_from $range;" >> "$TEMP_CONFIG"
    done <<< "$ipv6_ranges"
else
    log "ERROR: Failed to fetch IPv6 ranges"
    exit 1
fi

# Add footer
cat >> "$TEMP_CONFIG" << 'EOF'

# Use Cloudflare's connecting IP header
real_ip_header CF-Connecting-IP;
EOF

# Validate the new configuration
if nginx -t -c /dev/stdin < <(sed "s|include /etc/nginx/cloudflare|include $TEMP_CONFIG|" /etc/nginx/nginx.conf) 2>/dev/null; then
    # Move new configuration into place
    mv "$TEMP_CONFIG" "$CLOUDFLARE_CONFIG"
    log "Cloudflare IP configuration updated successfully"
    
    # Test nginx configuration
    if nginx -t; then
        log "Nginx configuration test passed"
        
        # Reload nginx
        if systemctl reload nginx; then
            log "Nginx reloaded successfully"
        else
            log "WARNING: Failed to reload nginx. Please reload manually."
        fi
    else
        log "ERROR: Nginx configuration test failed. Restoring backup."
        cp "$BACKUP_CONFIG" "$CLOUDFLARE_CONFIG"
        exit 1
    fi
else
    log "ERROR: New configuration failed validation. Keeping current configuration."
    rm -f "$TEMP_CONFIG"
    exit 1
fi

# Cleanup
rm -f "$TEMP_CONFIG"
log "Cloudflare IP update completed successfully"

# Optional: Log changes
if command -v diff >/dev/null 2>&1 && [[ -f "$BACKUP_CONFIG" ]]; then
    if ! diff -q "$BACKUP_CONFIG" "$CLOUDFLARE_CONFIG" >/dev/null; then
        log "Changes detected:"
        diff "$BACKUP_CONFIG" "$CLOUDFLARE_CONFIG" || true
    else
        log "No changes in IP ranges"
    fi
fi
