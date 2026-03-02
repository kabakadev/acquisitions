#!/bin/bash

# docker-manage.sh - Utility to manage Docker environments for acquisitions app

COMMAND=$1

case "$COMMAND" in
  "dev:up")
    echo "Starting Development Environment (with Neon Local)..."
    docker compose -f docker-compose.dev.yml --env-file .env.development up --build
    ;;
  "dev:down")
    echo "Stopping Development Environment..."
    docker compose -f docker-compose.dev.yml down -v
    ;;
  "prod:up")
    echo "Starting Production Environment..."
    docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
    ;;
  "prod:down")
    echo "Stopping Production Environment..."
    docker compose -f docker-compose.prod.yml down
    ;;
  "logs:dev")
    docker compose -f docker-compose.dev.yml logs -f
    ;;
  "logs:prod")
    docker compose -f docker-compose.prod.yml logs -f
    ;;
  *)
    echo "Usage: ./docker-manage.sh {dev:up|dev:down|prod:up|prod:down|logs:dev|logs:prod}"
    exit 1
    ;;
esac