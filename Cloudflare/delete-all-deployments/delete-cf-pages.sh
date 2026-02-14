#!/usr/bin/env bash
set -e

export CF_API_TOKEN="API_TOKEN"
export CF_ACCOUNT_ID="Account_ID"
export CF_PAGES_PROJECT_NAME="bankaitechdocs"
export CF_DELETE_ALIASED_DEPLOYMENTS=true

npm start