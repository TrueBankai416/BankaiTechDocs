#!/bin/bash

# Setup script for Docusaurus project
echo "====== Running Docusaurus Setup ======"

# Create environment variables for local development
echo "----- Setting up environment variables -----"
echo "ALGOLIA_APP_ID=LOCAL_DEV" > .env
echo "ALGOLIA_API_KEY=LOCAL_DEV" >> .env
echo "ALGOLIA_INDEX_NAME=LOCAL_DEV" >> .env
# Use a properly formatted placeholder for PostHog API key
echo "POSTHOG_API_KEY=phc_placeholder" >> .env
# Add a placeholder for Mendable search if used in config
echo "MENDABLE_KEY=placeholder" >> .env
echo "Environment variables set."

# Only remove node_modules if package.json has changed since node_modules was last modified
# to avoid unnecessary reinstalls
echo "----- Checking dependencies -----"
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo "Installing dependencies..."
  
  # Use npm ci for consistent installations (same as in GitHub Actions)
  if npm ci; then
    echo "✅ Dependencies installed successfully with npm ci."
  else
    echo "npm ci failed, falling back to npm install..."
    
    # Fallback to npm install if npm ci fails
    if npm install; then
      echo "✅ Dependencies installed successfully with npm install."
    else
      echo "❌ Dependency installation failed."
      exit 1
    fi
  fi
else
  echo "✅ Dependencies already up to date."
fi

# Verify node_modules exists
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules directory doesn't exist. Installation failed."
  exit 1
fi

# Check for TypeScript
echo "----- Checking TypeScript -----"
if npx tsc --version; then
  echo "✅ TypeScript is installed correctly."
else
  echo "❌ TypeScript is not working properly."
  exit 1
fi

# Check for Docusaurus configuration
echo "----- Checking Docusaurus configuration -----"
if [ -f "docusaurus.config.ts" ]; then
  echo "✅ Docusaurus configuration file found."
else
  echo "❌ docusaurus.config.ts not found!"
  exit 1
fi

# Check sidebar configuration
if [ -f "sidebars/customSidebar.ts" ]; then
  echo "✅ Custom sidebar configuration found."
else
  echo "⚠️ Custom sidebar configuration not found!"
fi

# Show Docusaurus version
echo "----- Docusaurus information -----"
if npx docusaurus --version; then
  echo "✅ Docusaurus CLI is working properly."
else
  echo "⚠️ Docusaurus CLI check failed."
fi

echo "====== Setup complete! ======"
echo "You can now start development with: npm start"
echo "Run checks with: bash .mentat/precommit.sh"