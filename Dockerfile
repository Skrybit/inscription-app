# Use Node.js 20 LTS as the base image
FROM node:22.18-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists) for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]