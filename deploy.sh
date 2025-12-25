#!/bin/bash
set -e

echo "🚀 Deploying Plus Proche..."

echo "📦 Deploying PartyKit WebSocket server..."
npx partykit deploy

echo "🌐 Deploying Vercel frontend + API..."
vercel --prod

echo "✅ Deployment complete!"
