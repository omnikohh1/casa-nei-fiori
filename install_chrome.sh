#!/bin/bash

echo "➡️  Installing dependencies..."
apt-get update
apt-get install -y wget curl unzip gnupg

echo "➡️  Adding Google Chrome repository..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

echo "➡️  Updating package list..."
apt-get update

echo "➡️  Installing Google Chrome..."
apt-get install -y google-chrome-stable

echo "✅ Google Chrome installed successfully!"
