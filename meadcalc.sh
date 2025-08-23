#!/usr/bin/env bash
source <(curl -s https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/misc/build.func)
# Copyright (c) 2021-2024 Your Name
# Author: Your Name (your.email@example.com)
# License: MIT
# https://github.com/jacksoneyton/MeadCalc

function header_info {
clear
cat <<"EOF"
    __  ___               ________      __   
   /  |/  /__  ____ _____/ / ____/___ _/ /___
  / /|_/ / _ \/ __ `/ __  / /   / __ `/ / ___/
 / /  / /  __/ /_/ / /_/ / /___/ /_/ / / /__  
/_/  /_/\___/\__,_/\__,_/\____/\__,_/_/\___/  
                                             
EOF
}

header_info
echo -e "Loading..."
APP="MeadCalc"
var_disk="4"
var_cpu="1"
var_ram="512"
var_os="ubuntu"
var_version="22.04"
variables
color
catch_errors

function default_settings() {
  CT_TYPE="1"
  PW=""
  CT_ID=$NEXTID
  HN=$NSAPP
  DISK_SIZE="$var_disk"
  CORE_COUNT="$var_cpu"
  RAM_SIZE="$var_ram"
  BRG="vmbr0"
  NET=dhcp
  GATE=""
  APT_CACHER=""
  APT_CACHER_IP=""
  DISABLEIP6="no"
  MTU=""
  SD=""
  NS=""
  MAC=""
  VLAN=""
  SSH="no"
  VERB="no"
  echo_default
}

function update_script() {
header_info
if [[ ! -d /var/www/meadcalc ]]; then msg_error "No ${APP} Installation Found!"; exit; fi
msg_info "Updating ${APP}"

# Stop nginx
systemctl stop nginx

# Backup current files
cp -r /var/www/meadcalc /var/www/meadcalc.backup.$(date +%Y%m%d_%H%M%S)

# Download latest files from your repo
cd /tmp
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/index.html -O index.html
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/styles.css -O styles.css  
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/calculator.js -O calculator.js
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/MeadCalc_logo.png -O MeadCalc_logo.png 2>/dev/null || true

# Copy to web directory
cp index.html styles.css calculator.js /var/www/meadcalc/
[ -f MeadCalc_logo.png ] && cp MeadCalc_logo.png /var/www/meadcalc/

# Set permissions
chown -R www-data:www-data /var/www/meadcalc
chmod -R 755 /var/www/meadcalc

# Start nginx
systemctl start nginx

# Clean up
rm -f /tmp/index.html /tmp/styles.css /tmp/calculator.js /tmp/MeadCalc_logo.png

msg_ok "Updated ${APP}"
exit
}

function install_app() {
  msg_info "Installing Dependencies"
  $STD apt-get update
  $STD apt-get install -y curl sudo mc nginx
  msg_ok "Installed Dependencies"

  msg_info "Setting Up Nginx"
  systemctl enable nginx
  msg_ok "Setup Nginx"

  msg_info "Creating ${APP} User"
  useradd -r -s /bin/bash -d /opt/meadcalc meadcalc
  mkdir -p /opt/meadcalc
  chown meadcalc:meadcalc /opt/meadcalc
  msg_ok "Created ${APP} User"

  msg_info "Installing ${APP}"
  # Create web directory
  mkdir -p /var/www/meadcalc
  cd /tmp

  # Download application files from your GitHub repo
  wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/index.html -O index.html
  wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/styles.css -O styles.css
  wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/calculator.js -O calculator.js
  wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/MeadCalc_logo.png -O MeadCalc_logo.png 2>/dev/null || echo "Logo not found, continuing..."

  # Copy files to web directory
  cp index.html styles.css calculator.js /var/www/meadcalc/
  [ -f MeadCalc_logo.png ] && cp MeadCalc_logo.png /var/www/meadcalc/

  # Set permissions
  chown -R www-data:www-data /var/www/meadcalc
  chmod -R 755 /var/www/meadcalc

  # Create nginx site configuration
  cat > /etc/nginx/sites-available/meadcalc << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/meadcalc;
    index index.html;
    server_name _;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        try_files $uri $uri/ /index.html;
        
        # No cache for HTML files
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Block hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

  # Enable site
  ln -sf /etc/nginx/sites-available/meadcalc /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  # Test nginx config
  nginx -t

  # Clean up downloaded files
  rm -f /tmp/index.html /tmp/styles.css /tmp/calculator.js /tmp/MeadCalc_logo.png

  msg_ok "Installed ${APP}"

  msg_info "Creating Update Script"
  cat > /usr/local/bin/update-meadcalc << 'UPDATEEOF'
#!/bin/bash
# MeadCalc Update Script

echo "Backing up current files..."
cp -r /var/www/meadcalc /var/www/meadcalc.backup.$(date +%Y%m%d_%H%M%S)

echo "Downloading latest version..."
cd /tmp
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/index.html -O index.html
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/styles.css -O styles.css
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/calculator.js -O calculator.js
wget -q https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/MeadCalc_logo.png -O MeadCalc_logo.png 2>/dev/null || true

echo "Installing updates..."
cp index.html styles.css calculator.js /var/www/meadcalc/
[ -f MeadCalc_logo.png ] && cp MeadCalc_logo.png /var/www/meadcalc/

chown -R www-data:www-data /var/www/meadcalc
chmod -R 755 /var/www/meadcalc

systemctl reload nginx

rm -f /tmp/index.html /tmp/styles.css /tmp/calculator.js /tmp/MeadCalc_logo.png

echo "Update complete! Visit http://$(hostname -I | awk '{print $1}') to see changes."
UPDATEEOF

  chmod +x /usr/local/bin/update-meadcalc
  msg_ok "Created Update Script"

  msg_info "Starting Services"
  systemctl restart nginx
  msg_ok "Started Services"

  msg_info "Cleaning Up"
  $STD apt-get autoremove
  $STD apt-get autoclean
  msg_ok "Cleaned"
}

start
build_container
description

msg_ok "Completed Successfully!\n"
echo -e "${APP} should be reachable by going to the following URL.
         ${BL}http://${IP}${CL} \n"