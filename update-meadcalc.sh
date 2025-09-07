#!/bin/bash

# MeadCalc Update Script
# Updates MeadCalc web application from GitHub repository
# Usage: ./update-meadcalc.sh or curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/update-meadcalc.sh | bash

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
GITHUB_API="https://api.github.com/repos/jacksoneyton/MeadCalc/contents"
WEB_ROOT="/var/www/meadcalc"
BACKUP_DIR="/var/www/meadcalc-backups"
TEMP_DIR="/tmp/meadcalc-update"

# Get list of web files from GitHub repository (silent version)
get_web_files_silent() {
    # Define web file extensions we want to include
    local web_extensions=("html" "css" "js" "png" "jpg" "jpeg" "gif" "svg" "ico" "woff" "woff2" "ttf" "json")
    local files=()
    
    # Get repository contents from GitHub API
    local repo_contents
    if repo_contents=$(curl -s "$GITHUB_API" 2>/dev/null); then
        # Parse JSON to get file names (works without jq)
        while IFS= read -r line; do
            # Extract filename from JSON line containing "name"
            if [[ $line =~ \"name\":[[:space:]]*\"([^\"]+)\" ]]; then
                local filename="${BASH_REMATCH[1]}"
                local extension="${filename##*.}"
                
                # Check if file has a web extension
                for web_ext in "${web_extensions[@]}"; do
                    if [[ "$extension" == "$web_ext" ]]; then
                        files+=("$filename")
                        break
                    fi
                done
            fi
        done <<< "$repo_contents"
    fi
    
    # Fallback to hardcoded list if API fails
    if [[ ${#files[@]} -eq 0 ]]; then
        files=("index.html" "styles.css" "calculator.js" "MeadCalc_logo.png")
    fi
    
    printf '%s\n' "${files[@]}"
}

echo "🔄 MeadCalc Update Script"
echo "========================"

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    log_error "This script must be run as root or with sudo"
    exit 1
fi

# Check for required commands
for cmd in wget curl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        log_error "Required command '$cmd' not found. Please install it first."
        exit 1
    fi
done

# Check if web directory exists
if [ ! -d "$WEB_ROOT" ]; then
    log_error "MeadCalc directory not found at $WEB_ROOT"
    log_error "Please ensure MeadCalc is installed first"
    exit 1
fi

# Get dynamic file list with proper logging
log_info "Discovering web files from repository..."
mapfile -t FILES < <(get_web_files_silent)

# Log the results
if [[ ${#FILES[@]} -gt 4 ]]; then
    log_success "Discovered ${#FILES[@]} web files from repository"
else
    log_warning "Using fallback file list"
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
        file_size=$(stat -c%s "$file" 2>/dev/null || echo "0")
        log_success "Downloaded $file (${file_size} bytes)"
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

# List downloaded files for debugging
log_info "Files in temp directory:"
ls -la "$TEMP_DIR"

# Verify critical files were downloaded
critical_files=("index.html" "styles.css" "calculator.js")
for file in "${critical_files[@]}"; do
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
        log_success "Updated $file"
        # Verify the copy worked
        if [ -f "$WEB_ROOT/$file" ]; then
            target_size=$(stat -c%s "$WEB_ROOT/$file" 2>/dev/null || echo "0")
            log_info "Verified $file in web directory (${target_size} bytes)"
        else
            log_error "Failed to copy $file to web directory"
        fi
    else
        log_warning "File $file not found in temp directory, skipping"
    fi
done

# Set proper permissions
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"

# Clear browser caches by updating file timestamps
log_info "Clearing browser caches..."
find "$WEB_ROOT" -name "*.js" -o -name "*.css" -o -name "*.html" | xargs touch

# Clear any nginx caches
log_info "Clearing server caches..."
if [ -d "/var/cache/nginx" ]; then
    rm -rf /var/cache/nginx/*
fi

# Test nginx configuration
if nginx -t >/dev/null 2>&1; then
    # Force restart nginx to clear all caches
    systemctl restart nginx
    log_success "Nginx restarted successfully with cleared caches"
else
    log_warning "Nginx configuration test failed, but continuing..."
fi

# Add cache-busting info to HTML files
log_info "Adding cache-busting timestamp..."
timestamp=$(date +%s)
for html_file in "$WEB_ROOT"/*.html; do
    if [ -f "$html_file" ]; then
        # Add timestamp comment to force browser refresh
        sed -i "1i<!-- Cache bust: $timestamp -->" "$html_file"
    fi
done

# Cleanup
cd /
rm -rf "$TEMP_DIR"

# Keep only the last 5 backups
log_info "Cleaning up old backups (keeping last 5)..."
cd "$BACKUP_DIR"
ls -1t meadcalc-backup-* 2>/dev/null | tail -n +6 | xargs -r rm -rf
log_success "Backup cleanup completed"

# Final verification
log_info "Performing final verification..."
if [ -f "$WEB_ROOT/calculator.js" ] && [ -f "$WEB_ROOT/index.html" ] && [ -f "$WEB_ROOT/styles.css" ]; then
    js_size=$(stat -c%s "$WEB_ROOT/calculator.js")
    html_size=$(stat -c%s "$WEB_ROOT/index.html")
    css_size=$(stat -c%s "$WEB_ROOT/styles.css")
    log_success "Core files verified:"
    log_info "  calculator.js: ${js_size} bytes"
    log_info "  index.html: ${html_size} bytes"
    log_info "  styles.css: ${css_size} bytes"
    
    # Check if calculator.js contains key functions
    if grep -q "calculateABV\|performConversion" "$WEB_ROOT/calculator.js"; then
        log_success "JavaScript functions verified in calculator.js"
    else
        log_error "JavaScript functions missing or corrupted in calculator.js"
    fi
else
    log_error "Critical files missing after update!"
fi

echo ""
log_success "MeadCalc update completed successfully!"
echo ""
echo "📋 Update Summary:"
echo "   Backup created: $BACKUP_PATH"
echo "   Files updated: ${FILES[*]}"
echo "   Web root: $WEB_ROOT"
echo "   Cache busting: Applied"
echo "   Nginx: Restarted with cleared caches"
echo ""
echo "🌐 Your MeadCalc installation has been updated with the latest version!"
echo ""
echo "🔧 Clear your browser cache or use Ctrl+F5 to force refresh the page"
echo ""
echo "📝 To rollback if needed:"
echo "   sudo cp -r $BACKUP_PATH/* $WEB_ROOT/"
echo "   sudo chown -R www-data:www-data $WEB_ROOT"
echo "   sudo systemctl restart nginx"
echo ""