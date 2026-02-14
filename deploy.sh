#!/bin/bash
# Deploy to Cloudflare Workers

# Set secrets
echo "Setting secrets..."
wrangler secret put YOUTUBE_API_KEY <<< "AIzaSyAzNt5EQvnRXmUvEa8QgX7xainuen9L2NE"
wrangler secret put NEWS_API_KEY <<< "817e1ee4be4e4b51bea9bdfbec7c969e"

# Deploy
echo "Deploying..."
wrangler deploy

echo "Done!"
