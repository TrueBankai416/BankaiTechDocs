#!/bin/bash

# Create environment variables for local development
echo "----- Setting up environment variables -----"
# Create .env file with development placeholders
cat > .env << EOL
# Development environment variables
ALGOLIA_APP_ID=LOCAL_DEV
ALGOLIA_API_KEY=LOCAL_DEV
ALGOLIA_INDEX_NAME=LOCAL_DEV
POSTHOG_API_KEY=phc_000000000000000000000000000000000000
MENDABLE_KEY=dev_key
EOL
echo "Environment variables set for local development."

echo "----- Installing dependencies -----"
# Check if node_modules exists and if package-lock.json has changed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo "Installing dependencies with --legacy-peer-deps..."
  # Add --no-fund to avoid funding messages and prevent potential hanging
  npm install --legacy-peer-deps --no-fund --no-audit
  
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

# Check Docusaurus dependency by checking package.json instead of running CLI
echo "----- Checking Docusaurus installation -----"
if grep -q "@docusaurus/core" package.json; then
  DOCUSAURUS_VERSION=$(grep -o '"@docusaurus/core": "\^[0-9.]*"' package.json | cut -d'"' -f4)
  echo "Docusaurus core version ${DOCUSAURUS_VERSION} found in package.json"
else
  echo "WARNING: Docusaurus core dependency not found in package.json"
fi

# Skip the build step in the setup script as it's already run in precommit
echo "----- Setup complete -----"
echo "✅ Project is ready for development."
echo "Run 'npm start' to start the development server."
echo "The precommit script will handle building the project before commits."