#!/bin/bash
set -e

echo "Installing Google Chrome..."
apt-get update
apt-get install -y wget curl unzip gnupg

wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | tee /etc/apt/sources.list.d/google-chrome.list
apt-get update
apt-get install -y google-chrome-stable

echo "Chrome installed successfully."

