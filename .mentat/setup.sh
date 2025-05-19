#!/bin/bash

# Setup script for Docusaurus project
echo "----- Setting up development environment -----"

# Note: Create your own .env file manually if needed
# See documentation for required environment variables

echo "----- Installing dependencies -----"
# Check if node_modules exists and if package-lock.json has changed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo "Installing dependencies with --legacy-peer-deps..."
  npm install --legacy-peer-deps --no-fund
  
  # Verify that the installation succeeded
  if [ ! -d "node_modules" ]; then
    echo "ERROR: Dependencies installation failed."
    exit 1
  fi
  echo "Dependencies installed successfully."
else
  echo "Dependencies are up to date."
fi

# Verify key project files exist
echo "----- Verifying project configuration -----"
if [ ! -f "sidebars/customSidebar.ts" ]; then
  echo "WARNING: Custom sidebar configuration not found!"
  echo "Creating empty sidebar file to prevent errors..."
  mkdir -p sidebars
  echo "export default {};" > sidebars/customSidebar.ts
else
  echo "Custom sidebar configuration found."
fi

# Check if Docusaurus is installed
echo "----- Checking dependencies -----"
if [ -d "node_modules/@docusaurus" ]; then
  echo "Docusaurus modules found in node_modules"
else
  echo "WARNING: Docusaurus modules not found, please check your installation"
fi

# Skip the build step in the setup script
echo "----- Setup complete -----"
echo "✅ Project is ready for development."
echo "Run 'npm start' to start the development server."
echo "The precommit script will handle building the project before commits."