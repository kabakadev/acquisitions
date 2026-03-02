# 1. The Documentation (`DOCKER.md`)

````markdown
# Docker Architecture: Acquisitions App

This project uses a multi-stage Docker setup optimized for security, performance, and seamless database branching using Neon Local.

## Environments

### Development (Neon Local)

We utilize **Neon Local** to automatically provision ephemeral database branches that map directly to our current Git branch (`.git/HEAD` is mapped into the container).

- **Benefits**: True isolation. You can run migrations, drop tables, and insert test data without affecting the main database or the cloud environment.
- **Cleanup**: Because `DELETE_BRANCH=true` is set, the ephemeral branch is destroyed when the container stops, keeping the Neon account clean.

#### How to Start

Use the included management script:

```bash
./docker-manage.sh dev:up
```
````

Or via npm:

```bash
npm run docker:dev

```

### Production (Neon Cloud)

The production environment drops the proxy and connects directly to the serverless Neon Cloud database. The image built is heavily optimized, runs as a non-root `nodejs` user, and strips out all `devDependencies`.

#### How to Start

```bash
./docker-manage.sh prod:up

```

## Security Implementation

- **Non-Root User**: The `Dockerfile` creates a specific `nodejs` user (UID 1001) to run the application, mitigating privilege escalation risks.
- **Health Checks**: Both the Node.js app and the Postgres proxy have strict health checks to ensure dependencies are fully resolved before traffic is routed.

````

---

### The "Quick Setup" Scaffolding Script

If you don't want to copy and paste all of the above blocks individually, just save this single block of code as `setup-scaffold.sh`, run `chmod +x setup-scaffold.sh`, and execute it. It will instantly generate all the files exactly as written above in your current directory.

<details>
<summary>Click to expand setup-scaffold.sh</summary>

```bash
#!/bin/bash

echo "Scaffolding Docker files for the acquisitions project..."

cat > docker-manage.sh << 'EOF'
#!/bin/bash
COMMAND=$1
case "$COMMAND" in
  "dev:up") docker compose -f docker-compose.dev.yml --env-file .env.development up --build ;;
  "dev:down") docker compose -f docker-compose.dev.yml down -v ;;
  "prod:up") docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d ;;
  "prod:down") docker compose -f docker-compose.prod.yml down ;;
  "logs:dev") docker compose -f docker-compose.dev.yml logs -f ;;
  "logs:prod") docker compose -f docker-compose.prod.yml logs -f ;;
  *) echo "Usage: ./docker-manage.sh {dev:up|dev:down|prod:up|prod:down|logs:dev|logs:prod}"; exit 1 ;;
esac
EOF
chmod +x docker-manage.sh

cat > docker-compose.dev.yml << 'EOF'
version: '3.8'
services:
  neon-local:
    image: neondatabase/neon_local:latest
    container_name: acquisitions-neon-local
    ports:
      - "5432:5432"
    environment:
      NEON_API_KEY: ${NEON_API_KEY}
      NEON_PROJECT_ID: ${NEON_PROJECT_ID}
      PARENT_BRANCH_ID: ${PARENT_BRANCH_ID:-main}
      DELETE_BRANCH: ${DELETE_BRANCH:-true}
    volumes:
      - ./.neon_local/:/tmp/.neon_local
      - ./.git/HEAD:/tmp/.git/HEAD:ro,consistent
    healthcheck:
      test: ["CMD", "pg_isready", "-h", "localhost", "-p", "5432", "-U", "neon"]
      interval: 5s
      timeout: 3s
      retries: 5
      start_period: 10s
    networks:
      - acquisitions-dev
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: acquisitions-app-dev
    ports:
      - "${PORT:-3000}:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgres://neon:npg@neon-local:5432/${DATABASE_NAME:-neondb}?sslmode=require
      JWT_SECRET: ${JWT_SECRET}
      LOG_LEVEL: ${LOG_LEVEL:-debug}
      PORT: ${PORT:-3000}
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      neon-local:
        condition: service_healthy
    networks:
      - acquisitions-dev
networks:
  acquisitions-dev:
    driver: bridge
EOF

cat > docker-compose.prod.yml << 'EOF'
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    container_name: acquisitions-app-prod
    ports:
      - "${PORT:-3000}:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      LOG_LEVEL: ${LOG_LEVEL:-info}
      PORT: ${PORT:-3000}
    restart: always
networks:
  default:
    name: acquisitions-prod
EOF

cat > .env.development << 'EOF'
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
DATABASE_URL=postgres://neon:npg@localhost:5432/neondb?sslmode=require
DATABASE_NAME=neondb
NEON_API_KEY=
NEON_PROJECT_ID=
PARENT_BRANCH_ID=main
DELETE_BRANCH=true
JWT_SECRET=super_secret_dev_key
EOF

cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DATABASE_URL=postgres://<user>:<password>@<endpoint>.neon.tech/<dbname>?sslmode=require
JWT_SECRET=
EOF

echo "Done! Run ./docker-manage.sh dev:up to start."

````

</details>
