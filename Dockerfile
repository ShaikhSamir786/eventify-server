# Server Dockerfile

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies (needed for tsc)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built assets from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
