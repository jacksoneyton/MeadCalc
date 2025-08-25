#!/usr/bin/env bash

# MeadCalc Standalone LXC Deployment Script
# Author: Jackson Eyton (jackson.eyton@gmail.com)
# License: MIT
# https://github.com/jacksoneyton/MeadCalc

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Header
clear
cat << 'EOF'
    __  ___               ________      __   
   /  |/  /__  ____ _____/ / ____/___ _/ /___
  / /|_/ / _ \/ __ `/ __  / /   / __ `/ / ___/
 / /  / /  __/ /_/ / /_/ / /___/ /_/ / / /__  
/_/  /_/\___/\__,_/\__,_/\____/\__,_/_/\___/  
                                             
EOF

echo -e "${GREEN}MeadCalc LXC Container Deployment${NC}"
echo "=================================="

# Configuration
APP="MeadCalc"
DISK_SIZE="4"
CPU_CORES="1"
RAM_SIZE="512"
HOSTNAME="meadcalc"

# Get next available container ID
get_next_id() {
    local next_id
    if command -v pvesh >/dev/null 2>&1; then
        next_id=$(pvesh get /cluster/nextid 2>/dev/null || echo "100")
    else
        for id in {100..999}; do
            if ! pct list | grep -q "^$id "; then
                next_id=$id
                break
            fi
        done
        next_id=${next_id:-100}
    fi
    echo "$next_id"
}

CTID=$(get_next_id)

log_info "Container Configuration:"
echo "  🆔  Container ID: $CTID"
echo "  🖥️  OS: Ubuntu 22.04"
echo "  💾  Disk: ${DISK_SIZE}GB"
echo "  🧠  CPU: ${CPU_CORES} cores"  
echo "  🛠️  RAM: ${RAM_SIZE}MB"
echo "  🏷️  Hostname: $HOSTNAME"
echo ""

# Check if running on Proxmox
if ! command -v pct >/dev/null 2>&1; then
    log_error "This script requires Proxmox VE (pct command not found)"
    exit 1
fi

# Check for Ubuntu template
TEMPLATE="ubuntu-22.04-standard_22.04-1_amd64.tar.zst"
if ! pveam list local | grep -q "$TEMPLATE"; then
    log_warning "Ubuntu 22.04 template not found. Downloading..."
    pveam download local "$TEMPLATE" || {
        log_error "Failed to download template"
        exit 1
    }
fi

# Create container
log_info "Creating LXC container..."
pct create "$CTID" "local:vztmpl/$TEMPLATE" \
    --hostname "$HOSTNAME" \
    --cores "$CPU_CORES" \
    --memory "$RAM_SIZE" \
    --swap 0 \
    --rootfs "local-lvm:$DISK_SIZE" \
    --net0 "name=eth0,bridge=vmbr0,ip=dhcp" \
    --unprivileged 1 \
    --features nesting=1 \
    --ostype ubuntu \
    --password="" || {
    log_error "Failed to create container"
    exit 1
}

log_success "Container $CTID created"

# Start container
log_info "Starting container..."
pct start "$CTID" || {
    log_error "Failed to start container"
    exit 1
}

# Wait for network
log_info "Waiting for network connectivity..."
for i in {1..30}; do
    if pct exec "$CTID" -- ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "Network timeout"
        exit 1
    fi
    sleep 2
done

log_success "Network is ready"

# Set container description
pct set "$CTID" -description "# MeadCalc
Mead brewing calculator with ABV, specific gravity, and ingredient calculations.
Repository: https://github.com/jacksoneyton/MeadCalc
Deployed: $(date)"

# Install dependencies
log_info "Installing dependencies..."
pct exec "$CTID" -- apt-get update >/dev/null 2>&1
pct exec "$CTID" -- apt-get install -y nginx curl wget >/dev/null 2>&1

# Configure nginx and install MeadCalc
log_info "Setting up MeadCalc..."
pct exec "$CTID" -- bash << 'INSTALL_SCRIPT'
# Enable nginx
systemctl enable nginx >/dev/null 2>&1

# Create web directory
mkdir -p /var/www/meadcalc
cd /tmp

# Download MeadCalc files
echo "Downloading MeadCalc files..."
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/index.html -O index.html
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/styles.css -O styles.css
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/calculator.js -O calculator.js
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/MeadCalc_logo.png -O MeadCalc_logo.png 2>/dev/null || echo "Logo download failed, continuing..."

# Copy files to web directory
cp index.html styles.css calculator.js /var/www/meadcalc/
[ -f MeadCalc_logo.png ] && cp MeadCalc_logo.png /var/www/meadcalc/

# Set permissions
chown -R www-data:www-data /var/www/meadcalc
chmod -R 755 /var/www/meadcalc

# Create nginx configuration
cat > /etc/nginx/sites-available/meadcalc << 'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/meadcalc;
    index index.html;
    server_name _;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        try_files $uri $uri/ /index.html;
        
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
    
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
NGINXCONF

# Enable site
ln -sf /etc/nginx/sites-available/meadcalc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
nginx -t >/dev/null 2>&1 && systemctl restart nginx

# Clean up
rm -f /tmp/index.html /tmp/styles.css /tmp/calculator.js /tmp/MeadCalc_logo.png
INSTALL_SCRIPT

# Create comprehensive update script
log_info "Creating update script..."
pct exec "$CTID" -- bash << 'UPDATE_SCRIPT'
cat > /usr/local/bin/update-meadcalc << 'UPDATER'
#!/bin/bash

# MeadCalc Update Script
# Updates MeadCalc web application from GitHub repository

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
GITHUB_REPO="https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master"
WEB_ROOT="/var/www/meadcalc"
BACKUP_DIR="/var/www/meadcalc-backups"
TEMP_DIR="/tmp/meadcalc-update"

# Files to download and update
FILES=(
    "index.html"
    "styles.css"
    "calculator.js"
    "MeadCalc_logo.png"
)

echo "🔄 MeadCalc Update Script"
echo "========================"

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root or with sudo"
    exit 1
fi

# Check if web directory exists
if [ ! -d "$WEB_ROOT" ]; then
    log_error "MeadCalc directory not found at $WEB_ROOT"
    log_error "Please ensure MeadCalc is installed first"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create backup
BACKUP_NAME="meadcalc-backup-$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

log_info "Creating backup at $BACKUP_PATH"
cp -r "$WEB_ROOT" "$BACKUP_PATH"
log_success "Backup created successfully"

# Create temporary directory
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download files
log_info "Downloading latest files from GitHub..."
for file in "${FILES[@]}"; do
    log_info "Downloading $file..."
    if wget -q "$GITHUB_REPO/$file" -O "$file"; then
        log_success "Downloaded $file"
    else
        # Handle optional files (like logo)
        if [[ "$file" == "MeadCalc_logo.png" ]]; then
            log_warning "Logo download failed, continuing without logo update..."
        else
            log_error "Failed to download $file"
            log_error "Aborting update to prevent broken installation"
            exit 1
        fi
    fi
done

# Verify critical files were downloaded
for file in "index.html" "styles.css" "calculator.js"; do
    if [ ! -f "$file" ]; then
        log_error "Critical file $file is missing"
        exit 1
    fi
done

# Copy files to web directory
log_info "Installing updated files..."
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$WEB_ROOT/"
        log_info "Updated $file"
    fi
done

# Set proper permissions
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Test nginx configuration
if nginx -t >/dev/null 2>&1; then
    # Reload nginx to ensure any changes take effect
    systemctl reload nginx
    log_success "Nginx configuration is valid and reloaded"
else
    log_warning "Nginx configuration test failed, but continuing..."
fi

# Cleanup
cd /
rm -rf "$TEMP_DIR"

# Keep only the last 5 backups
log_info "Cleaning up old backups (keeping last 5)..."
cd "$BACKUP_DIR"
ls -1t meadcalc-backup-* 2>/dev/null | tail -n +6 | xargs -r rm -rf
log_success "Backup cleanup completed"

echo ""
log_success "MeadCalc update completed successfully!"
echo ""
echo "📋 Update Summary:"
echo "   Backup created: $BACKUP_PATH"
echo "   Files updated: ${FILES[*]}"
echo "   Web root: $WEB_ROOT"
echo ""
echo "🌐 Your MeadCalc installation has been updated with the latest version!"
echo ""
echo "📝 To rollback if needed:"
echo "   sudo cp -r $BACKUP_PATH/* $WEB_ROOT/"
echo "   sudo chown -R www-data:www-data $WEB_ROOT"
echo "   sudo systemctl reload nginx"
echo ""
UPDATER
chmod +x /usr/local/bin/update-meadcalc
UPDATE_SCRIPT

# Get container IP
log_info "Getting container IP address..."
sleep 3
IP=$(pct exec "$CTID" -- hostname -I | awk '{print $1}' 2>/dev/null || echo "Unable to get IP")

# Final cleanup
log_info "Performing final cleanup..."
pct exec "$CTID" -- apt-get autoremove -y >/dev/null 2>&1
pct exec "$CTID" -- apt-get autoclean >/dev/null 2>&1

log_success "Deployment completed successfully!"
echo ""
echo "🌐 Your MeadCalc installation is ready!"
echo "   URL: http://$IP"
echo ""
echo "📋 Container Details:"
echo "   Container ID: $CTID" 
echo "   Hostname: $HOSTNAME"
echo "   IP Address: $IP"
echo ""
echo "🔧 Management Commands:"
echo "   Start:   pct start $CTID"
echo "   Stop:    pct stop $CTID"
echo "   Console: pct enter $CTID"
echo "   Update:  pct exec $CTID -- /usr/local/bin/update-meadcalc"
echo ""