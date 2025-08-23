# 🍯 MeadCalc

MeadCalc is a simple, browser-based **mead brewing sugar calculator**.  
It helps brewers calculate sugar additions for desired alcohol content, batch size, and sweetness level.

This repository contains:
- **HTML/CSS/JS** front-end for the MeadCalc web app
- **meadcalc.sh** script to deploy MeadCalc as an LXC container on a Proxmox server

---

## 🚀 Quick Deploy on Proxmox (No Cloning Required)

You can deploy MeadCalc directly to your Proxmox server with a single command — no need to clone this repository locally.

Run this on your **Proxmox host**:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/jacksoneyton/MeadCalc/main/meadcalc.sh)"
```

> **Note:**  
> - Ensure your Proxmox host has internet access.  
> - The script will create and configure an LXC container for MeadCalc.  
> - You may be prompted for container settings during execution.

---

## 📂 Project Structure

```
.
├── calculator.js       # Core calculation logic
├── index.html          # Main MeadCalc interface
├── styles.css          # Styling for the app
├── MeadCalc_logo.png   # Project logo
├── meadcalc.sh         # Proxmox LXC deployment script
├── future-features.md  # Planned enhancements
└── test.html           # Test page
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

- **For Proxmox deployment:**
  - Proxmox VE installed
  - SSH or console access to the Proxmox host
  - Sufficient resources for the LXC container
- **For local use:**
  - Any modern web browser

---

## 📌 Future Features
See [`future-features.md`](future-features.md) for planned updates.

---

**Author:** [jacksoneyton](https://github.com/jacksoneyton)  
**Repository:** [MeadCalc](https://github.com/jacksoneyton/MeadCalc)
