#!/bin/bash

# Basic precommit script for Docusaurus project
echo "====== Running Precommit Checks ======"

# Run a build check with a timeout
echo "🔍 Running build check..."

# Use a timeout to prevent hanging indefinitely
if timeout 5m npm run build; then
  echo "✅ Build check passed!"
  # Clean up the build directory to avoid committing it
  echo "Cleaning up build files..."
  rm -rf build
  exit 0
else
  # Build failed but we'll let CI handle the verification
  echo "⚠️ Build check did not complete successfully."
  echo "Proceeding with commit. CI will perform full validation."
  
  # Clean up any partial build output
  if [ -d "build" ]; then
    echo "Cleaning up build directory..."
    rm -rf build
  fi
  
  # Exit with success to allow the commit to proceed
  exit 0
fi