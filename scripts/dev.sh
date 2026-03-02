#!/bin/bash

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    exit 1
fi

if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    exit 1
fi

mkdir -p .neon_local

if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "✅ Added .neon_local/ to .gitignore"
fi

echo "📦 Building and starting development containers in the background..."
# Start in detached mode (-d) so the script can continue executing
docker compose -f docker-compose.dev.yml up --build -d

echo "⏳ Waiting for Neon Local and the Node App to become healthy..."
# The compose file has a healthcheck that takes around 30-40 seconds to fully clear. 
# We sleep briefly to give it a head start, though docker exec will also wait.
sleep 15 

echo "📜 Applying latest schema with Drizzle..."
# Run the migration INSIDE the isolated app container, not on your host machine
docker compose -f docker-compose.dev.yml exec app npm run db:migrate

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:3000"
echo "   Database: postgres://neon:npg@localhost:5433/neondb"
echo "================================================"
echo "👀 Tailing logs... (Press Ctrl+C to stop logs, containers will keep running)"
echo "   To completely stop the environment later, run: docker compose -f docker-compose.dev.yml down"

# Attach to the logs so you can see live output
docker compose -f docker-compose.dev.yml logs -f