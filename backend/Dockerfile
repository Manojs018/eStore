# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including dev)
RUN npm ci

COPY . .

# Prune dev dependencies for production use
RUN npm prune --production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy from build stage
# Copy package files (for reference)
COPY --from=builder /app/package*.json ./
# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
# Copy source code (excluding ignored files)
COPY --from=builder /app .

EXPOSE 5000

CMD ["npm", "start"]