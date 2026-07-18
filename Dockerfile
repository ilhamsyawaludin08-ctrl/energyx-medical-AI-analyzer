FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose application port
EXPOSE 3000

# Start the app using npm script
CMD ["npm", "run", "start"]
