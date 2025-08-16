# Use Node.js 18 as the base image for building
FROM node:22-alpine3.21 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the Vite app for production
RUN npm run build

# Use a lightweight image to serve the app
FROM node:22-alpine3.21

# Install serve to host the built app
RUN npm install -g serve

# Set working directory
WORKDIR /app

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000 (matches vite.config.js)
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]