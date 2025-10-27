# Use Node.js as the base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (since you're using pnpm)
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install app dependencies
RUN pnpm install --frozen-lockfile

# Copy app source (this will override node_modules with fresh install)
COPY . .

# Build TypeScript code
RUN pnpm run build

# Expose port for HTTP server (optional for stdio, but good practice if http might be added)
EXPOSE 3000

# Start the STDIO server
CMD ["pnpm", "run", "start"]