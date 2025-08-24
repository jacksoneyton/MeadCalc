#!/usr/bin/env bash

# Test deployment script to debug the issue

set -euo pipefail

echo "Testing MeadCalc deployment script..."
echo "Bash version: $BASH_VERSION"

# Check if we're on Proxmox
if ! command -v pct >/dev/null 2>&1; then
    echo "Error: This script requires Proxmox VE"
    exit 1
fi

echo "Proxmox environment detected"
echo "Available containers:"
pct list | head -5

echo "Script syntax test passed!"