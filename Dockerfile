# Use Node.js base image
FROM node:18 AS build

# Copy server files
WORKDIR /app/server
COPY ./server /app/server

# Set the working directory to /app
WORKDIR /app

# Copy root package files and install root dependencies
COPY package.json ./
RUN npm install

# Copy and build the client
WORKDIR /app/client
COPY client/package.json ./
RUN npm install --force
COPY ./client /app/client
RUN npm run build  # Build client app
COPY ./client /app/client

# Expose the port your app runs on
EXPOSE 5000

WORKDIR /app
# Set the working directory for the server and start the server
CMD ["npm", "start"]
