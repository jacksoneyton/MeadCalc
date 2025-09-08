# MeadCalc

Browser-based mead brewing calculator for calculating ABV, specific gravity, and ingredient requirements. Supports imperial and metric units with real-time calculations.

**Live site:** https://meadcalc.com/

![MeadCalc Screenshot](ScreenShot.png)

## Features

### Calculators
- **ABV Calculator**: Convert OG/FG to alcohol percentage
- **Specific Gravity Calculator**: Calculate OG from honey and fruit additions
- **Target ABV Calculator**: Calculate ingredient amounts for desired alcohol content
- **Unit Converter**: Convert between ABV, ABW, SG, BRIX, and Baumé

### Input System
- Imperial units (lbs/oz, gallons) and metric units (kg/g, liters)
- Smart weight display (e.g., "2 lbs 8 oz" or "1.2 kg")
- Click/tap input fields to auto-select text for quick editing
- Real-time calculations as you type

### Ingredients
- Honey (80% fermentable sugar)
- 25+ fruits and sweeteners with accurate sugar content profiles
- Multiple ingredient support for complex recipes

### Interface
- Responsive design for desktop, tablet, and mobile
- Mobile-optimized portrait layout
- Built-in mead style reference guide

## Setup (LXC Container)

Deploy MeadCalc in an LXC container with nginx:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/meadcalc.sh)"
```

### What it does:
- Creates Ubuntu 22.04 LXC container
- Installs and configures nginx
- Downloads MeadCalc files
- Sets up CLI management tools

### Management commands:
```bash
# Inside container
meadcalc update    # Update to latest version
meadcalc status    # Show service status
meadcalc logs      # View access logs
meadcalc backup    # Create backup
```

### Manual update:
```bash
curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/master/update-meadcalc.sh | sudo bash
```

## Local Development

1. Clone repository:
   ```bash
   git clone https://github.com/jacksoneyton/MeadCalc.git
   cd MeadCalc
   ```

2. Open `index.html` in web browser

## Requirements

- **LXC deployment**: Proxmox VE 7.0+, 1 CPU, 512MB RAM, 4GB storage
- **Local use**: Modern web browser (Chrome, Firefox, Safari, Edge)

## Technical Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Server: nginx with gzip compression and security headers
- Container: Ubuntu 22.04 LXC
- Update system: Bash scripts with rollback support

## Files

```
calculator.js    # Core calculation logic
index.html       # Main interface
styles.css       # Responsive styling
meadcalc.sh      # LXC deployment script
update-meadcalc.sh # Update system
```

## Support

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/jacksoneyton)