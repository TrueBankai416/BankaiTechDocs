#!/bin/bash

# Enhanced precommit script for Docusaurus project
echo "====== Running Precommit Checks ======"

# Make sure node_modules exists before running any checks
if [ ! -d "node_modules" ]; then
  echo "❌ node_modules not found. Please run setup.sh first."
  exit 1
fi

else
  echo "❌ TypeScript check could not run. Make sure TypeScript is installed."
  exit 1
fi