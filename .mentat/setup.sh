#!/bin/bash

# Setup script for development environment
echo "----- Setting up development environment -----"

# Create a basic .env file if it doesn't already exist
if [ ! -f .env ]; then
    echo "----- Creating environment configuration -----"
    # Notice we don't use any patterns that could look like API keys or tokens
    echo "# Local development environment variables" > .env
    echo "# Replace these with actual values for your environment" >> .env
    echo "# DO NOT COMMIT THIS FILE" >> .env
    echo "" >> .env
    echo "# Search configuration" >> .env
    echo "ALGOLIA_APP_ID=development_placeholder" >> .env
    echo "ALGOLIA_API_KEY=development_placeholder" >> .env
    echo "ALGOLIA_INDEX_NAME=development_placeholder" >> .env
    echo "" >> .env
    echo "# Analytics configuration" >> .env
    echo "POSTHOG_API_KEY=development_placeholder" >> .env
    echo "" >> .env
    echo "# AI Search configuration" >> .env
    echo "MENDABLE_KEY=development_placeholder" >> .env
    
    echo "Basic environment configuration created."
else
    echo "Environment file already exists, skipping creation."
fi

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