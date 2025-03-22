#!/bin/bash

# Make the script executable
chmod +x ./install-eslint-deps.sh

echo "Making configuration files executable..."

# Check if there's an eslint.config.js and back it up if so
if [ -f "eslint.config.js" ]; then
  echo "Backing up eslint.config.js to eslint.config.js.bak"
  mv eslint.config.js eslint.config.js.bak
fi

echo "Running ESLint setup..."
./install-eslint-deps.sh

echo "Configuration fix complete! Please restart your development server." 