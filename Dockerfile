# Use Node.js 22 (alpine version for smaller size)
FROM node:22-alpine

# Set working directory
WORKDIR /src

# Install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the app
COPY . .

# Expose development server port (default for Vite)
EXPOSE 5173

# Start the dev server
CMD [ "npm", "run", "dev" ]
