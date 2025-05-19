#!/bin/bash

# Create environment variables for local development
echo "----- Setting up environment variables -----"
# Create .env file with development placeholders if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file with development placeholders..."
  echo "# Development environment variables" > .env
  echo "ALGOLIA_APP_ID=dev" >> .env
  echo "ALGOLIA_API_KEY=dev" >> .env
  echo "ALGOLIA_INDEX_NAME=dev" >> .env
  echo "POSTHOG_API_KEY=dev" >> .env
  echo "MENDABLE_KEY=dev" >> .env
  echo "Environment variables set for local development."
else
  echo "Using existing .env file."
fi

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

# Check Docusaurus dependency by checking package.json instead of running CLI command
echo "----- Checking Docusaurus installation -----"
if grep -q "@docusaurus/core" package.json; then
  echo "Docusaurus core found in package.json"
else
  echo "WARNING: Docusaurus core dependency not found in package.json"
fi

# Skip the build step in the setup script as it's already run in precommit
echo "----- Setup complete -----"
echo "✅ Project is ready for development."
echo "Run 'npm start' to start the development server."
echo "The precommit script will handle building the project before commits."