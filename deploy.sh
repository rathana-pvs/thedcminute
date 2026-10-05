#!/bin/bash
# deploy.sh — thedcminute VPS Deployment Script
set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying thedcminute...${NC}"

# 1. Pull latest code
echo "📥 Pulling latest code..."
git pull origin main || { echo -e "${RED}❌ Error: git pull failed.${NC}"; exit 1; }

# 2. Build production Next.js app
echo "🔨 Building production Next.js app..."
NODE_OPTIONS="--max-old-space-size=1536" npm run build

# 3. Reload PM2 process
echo "♻️  Reloading PM2 process..."
pm2 reload uspolicybrief

# 4. Health Check
echo "🔥 Checking application health..."
sleep 3
if curl -s -f -H "Host: thedcminute.com" http://localhost:3002 > /dev/null; then
    echo -e "${GREEN}✓ Application updated successfully!${NC}"
else
    echo -e "${RED}⚠️ Warning: Health check returned non-200. Check pm2 logs uspolicybrief${NC}"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
