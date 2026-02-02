#!/bin/bash
# Deploy API to Railway via CLI
# Prerequisites: railway login (one-time), railway link (one-time)
# Usage: ./scripts/deploy-railway.sh  OR  npm run deploy:railway

set -e
cd "$(dirname "$0")/.."

if ! command -v railway &>/dev/null; then
  echo "Railway CLI not found. Install: npm install -g @railway/cli"
  echo "Then run: railway login"
  exit 1
fi

echo "Deploying API from server/ to Railway..."
cd server
railway up
echo "Done. Check your Railway dashboard for the deployment URL."
