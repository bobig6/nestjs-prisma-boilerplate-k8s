# Use an official Node.js image as the base image
# Use an Alpine version for smaller image size
ARG NODE_VERSION=20.11.1
FROM node:${NODE_VERSION}-alpine as base

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies needed for Prisma and building packages
RUN apk add --no-cache bash openssl

# Copy package.json and package-lock.json for dependency installation
COPY package.json package-lock.json ./

# Install production dependencies (without dev dependencies)
RUN npm install --only=production

# Install Prisma CLI for database migrations
RUN npm install prisma --save-dev

# Copy only necessary files for production
COPY . ./

# Expose the application port
EXPOSE 3030

# Set environment variables for runtime configuration
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage for development dependencies (optional, for running tests or dev mode)
FROM base as development

# Install all dependencies (including dev dependencies)
RUN npm install

# Set environment for development
ENV NODE_ENV=development

# Run the prisma generate command to generate Prisma client
RUN npx prisma generate

# Default command for development mode
CMD ["npm", "run", "start:dev"]

# Stage for production-ready container
FROM base as production

# Set environment for production
ENV NODE_ENV=production

# Run the prisma generate command to generate Prisma client
RUN npx prisma generate

# Remove unnecessary files (like dev dependencies)
RUN npm prune --production

# Command to run the application
CMD ["npm", "run", "start:prod"]
