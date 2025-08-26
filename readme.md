# 🍯 MeadCalc

MeadCalc is a comprehensive, browser-based **mead brewing calculator** with smart unit conversion and professional deployment tools. It helps brewers calculate sugar additions for desired alcohol content, batch size, and sweetness level with support for both imperial and metric measurements.

**🌐 [Try MeadCalc](http://meadcalc.ddns.net)**

## ✨ Features

- 📊 **Dual Calculator System**: Basic calculator for existing recipes and Target ABV calculator for recipe design
- 🌍 **Smart Unit Display**: Automatic conversion between imperial (lbs/oz) and metric (kg/g) with intelligent formatting
- 🔧 **Professional CLI Tools**: Built-in `meadcalc` command for easy management
- 🔄 **Automated Updates**: One-command updates with automatic backups
- 🐳 **LXC Deployment**: Complete Proxmox container deployment with nginx
- 🎯 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

This repository contains:
- **HTML/CSS/JS** front-end for the MeadCalc web application
- **meadcalc.sh** script for automated LXC container deployment on Proxmox
- **update-meadcalc.sh** comprehensive update system with backup management
- **MeadCalc CLI tool** for easy container management

---

## 🚀 Quick Deploy on Proxmox (Recommended)

Deploy MeadCalc directly to your Proxmox server with a single command:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/meadcalc.sh)"
```

The deployment script will:
- ✅ Create and configure an Ubuntu 22.04 LXC container
- ✅ Install and configure nginx web server
- ✅ Download and install MeadCalc application files
- ✅ Set up automatic SSL headers and gzip compression
- ✅ Install comprehensive update system and CLI tools
- ✅ Provide you with the container IP and management commands

---

## 🎮 MeadCalc CLI Commands

After deployment, your container includes a powerful CLI tool for easy management:

```bash
# From within the container
meadcalc update    # Update to latest version
meadcalc status    # Show service status and info
meadcalc logs      # View nginx access logs
meadcalc backup    # Create manual backup
meadcalc help      # Show all commands

# From Proxmox host (replace CTID with your container ID)
pct exec CTID -- meadcalc update
```

## 🔄 Update Your Installation

### For containers deployed with the new system:
```bash
meadcalc update
```

### For any MeadCalc container (one-liner):
```bash
curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/update-meadcalc.sh | sudo bash
```

Updates include:
- ✅ **Automatic backups** with cleanup (keeps last 5)
- ✅ **Safe verification** of downloads before installation  
- ✅ **Error handling** with rollback instructions
- ✅ **nginx testing** and reload

---

## 📂 Project Structure

```
.
├── calculator.js           # Core calculation logic with smart unit display
├── index.html             # Main MeadCalc interface
├── styles.css             # Responsive styling
├── MeadCalc_logo.png      # Project logo
├── meadcalc.sh            # Proxmox LXC deployment script
├── update-meadcalc.sh     # Comprehensive update system
├── CONTAINER_UPDATE.md    # Update documentation and usage
├── future-features.md     # Planned enhancements
└── test.html              # Test page
```

---

## 🖥 Running MeadCalc Locally (Optional)

If you prefer to run MeadCalc without Proxmox:

1. Download the repository:
   ```bash
   git clone https://github.com/jacksoneyton/MeadCalc.git
   cd MeadCalc
   ```
2. Open `index.html` in your browser.

---

## 🛠 Requirements

### For Proxmox deployment:
- Proxmox VE 7.0+ with LXC support
- SSH or console access to the Proxmox host  
- Internet connectivity for downloading Ubuntu template and MeadCalc files
- Container resources: 1 CPU core, 512MB RAM, 4GB storage (configurable)

### For local development:
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, can run directly from filesystem)

---

## 🔧 Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 with responsive design
- **Backend**: nginx web server with optimized configuration
- **Container**: Ubuntu 22.04 LXC with security headers and gzip compression
- **Update System**: Bash-based with automatic rollback capabilities
- **Unit System**: Dual imperial/metric with intelligent display formatting

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📌 Roadmap

See [`future-features.md`](future-features.md) for planned enhancements and upcoming features.

---

**Author:** [jacksoneyton](https://github.com/jacksoneyton)  
**Repository:** [MeadCalc](https://github.com/jacksoneyton/MeadCalc)
