#!/bin/bash

# Production deployment script for Acquisitions App
# This script starts the application in production mode with Neon Cloud Database

echo "🚀 Starting Acquisitions App in Production Mode"
echo "==============================================="

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "   Please create .env.production with your production environment variables."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker and try again."
    exit 1
fi

# Prevent port 3000 collisions by stopping dev if it is running
if [ "$(docker ps -q -f name=acquisitions-app-dev)" ]; then
    echo "⚠️ Dev environment detected. Stopping it to free up port 3000..."
    docker compose -f docker-compose.dev.yml down
fi

echo "📦 Building and starting production container..."
echo "   - Using Neon Cloud Database (no local proxy)"
echo "   - Running in optimized production mode"
echo ""

# Start production environment
docker compose -f docker-compose.prod.yml up --build -d

echo "⏳ Waiting for container to initialize..."
sleep 5

# Run migrations with Drizzle using Production credentials
echo "📜 Applying latest schema to Neon Cloud with Drizzle..."
# Export the production variables so Drizzle uses the right DATABASE_URL
export $(grep -v '^#' .env.production | xargs)
npm run db:migrate

echo ""
echo "🎉 Production environment started!"
echo "   Application: http://localhost:3000"
echo "   Logs: docker logs -f acquisitions-app-prod"
echo ""
echo "Useful commands:"
echo "   View logs: docker logs -f acquisitions-app-prod"
echo "   Stop app: docker compose -f docker-compose.prod.yml down"