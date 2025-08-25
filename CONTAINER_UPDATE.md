# MeadCalc Container Update Commands

## Update MeadCalc on LXC Container

### Method 1: One-line command (Recommended)
Run this command on your LXC container to update MeadCalc:

```bash
curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/update-meadcalc.sh | sudo bash
```

### Method 2: Download and run script
```bash
# Download the script
wget https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/update-meadcalc.sh

# Make it executable
chmod +x update-meadcalc.sh

# Run the update
sudo ./update-meadcalc.sh
```

### Method 3: Use the pre-installed updater (if available)
If you deployed using the original meadcalc.sh script, you can use:
```bash
sudo /usr/local/bin/update-meadcalc
```

## From Proxmox Host

### Update container from Proxmox host
```bash
# Replace CTID with your container ID
pct exec CTID -- curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/update-meadcalc.sh | bash
```

## What the update does:

1. ✅ Creates a timestamped backup of current installation
2. ✅ Downloads latest files from GitHub (index.html, styles.css, calculator.js, logo)
3. ✅ Installs updated files to web directory
4. ✅ Sets proper permissions (www-data:www-data)
5. ✅ Reloads nginx configuration
6. ✅ Cleans up old backups (keeps last 5)
7. ✅ Provides rollback instructions if needed

## Rollback if needed:
If the update causes issues, you can rollback using the backup path shown in the update output:
```bash
sudo cp -r /var/www/meadcalc-backups/meadcalc-backup-TIMESTAMP/* /var/www/meadcalc/
sudo chown -R www-data:www-data /var/www/meadcalc
sudo systemctl reload nginx
```