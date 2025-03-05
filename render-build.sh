#!/bin/bash

set -e

echo "🛠️ Installazione Google Chrome..."
apt-get update && apt-get install -y wget unzip
wget -q -O chrome.zip https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
dpkg -i chrome.zip || true
apt-get install -f -y

echo "✅ Chrome installato!"
