# Acquisitions API 🚀

A production-ready Node.js REST API featuring automated ephemeral database branching, comprehensive rate-limiting and security middleware, and a fully automated multi-architecture Docker CI/CD pipeline.

This project demonstrates modern backend DevOps practices, transitioning from local Docker Compose environments to cloud-native deployments.

---

## 🛠 Tech Stack

| Category           | Technology                                           |
| ------------------ | ---------------------------------------------------- |
| **Runtime**        | Node.js (ESM)                                        |
| **Framework**      | Express.js                                           |
| **Database**       | PostgreSQL (Neon Cloud for Prod, Neon Local for Dev) |
| **ORM**            | Drizzle ORM                                          |
| **Security**       | Arcjet, JWT Authentication, Helmet, Zod Validation   |
| **Infrastructure** | Docker (Multi-stage builds), Docker Compose          |
| **CI/CD**          | GitHub Actions                                       |

---

## ✨ Key Features

### Ephemeral Database Branching

Utilizes Neon Local mapped to `.git/HEAD` to automatically spin up isolated database branches per Git branch during development.

### Role-Based Access Control (RBAC)

Granular JWT-based authorization restricting routes based on `admin` or `user` roles.

### Hardened Security

Integrated Arcjet middleware to dynamically rate-limit users vs. admins and block malicious bot traffic.

### Automated CI/CD

GitHub Actions workflows handle linting (ESLint/Prettier), testing with coverage reports, and building/pushing multi-architecture (AMD64/ARM64) Docker images to Docker Hub.

### Production-Optimized Containers

Non-root user execution, strict health checks, resource limitations, and dependency pruning in production builds.

---

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose installed
- A [Neon](https://neon.tech) account and API keys
- An [Arcjet](https://arcjet.com) key

---

### 1. Environment Configuration

Create two environment files in the root directory based on the provided templates (see `DOCKER.md` for detailed variables):

| File               | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `.env.development` | Neon Local configurations and local secrets          |
| `.env.production`  | Neon Cloud `DATABASE_URL` and production Arcjet keys |

---

### 2. Local Development (Neon Local)

This project includes a custom management script to handle the Docker lifecycle seamlessly.

Start the development environment (spins up the Node.js app with hot-reloading and the Neon Local proxy):

```bash
./docker-manage.sh dev:up
```
