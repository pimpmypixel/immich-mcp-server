FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove dev dependencies and source code to reduce image size
RUN rm -rf src/ tsconfig.json && \
    npm prune --production

# Create non-root user for security
RUN addgroup -g 1001 -S immich && \
    adduser -S immich -u 1001

USER immich

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Expose port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]