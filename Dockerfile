# Multi-stage Dockerfile for Node.js acquisitions application

# Base stage with Node.js
# (Using 20-alpine as specified in your original plan, though the tutorial uses 18)
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (Production only for the base image)
# Note: --omit=dev is the modern equivalent of --only=production in newer npm versions
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# ==========================================
# Development stage
# ==========================================
FROM base AS development

# Switch back to root temporarily to install dev dependencies
USER root
RUN npm ci && npm cache clean --force

# Switch back to secure user
USER nodejs

# Development command with hot reloading
CMD ["npm", "run", "dev"]

# ==========================================
# Production stage
# ==========================================
FROM base AS production

# Production command runs the entry point directly
CMD ["npm","start"]