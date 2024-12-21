# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Expose port (optional, if your app listens on a specific port)
EXPOSE 3000

# Run the data export script first, then start the application using 'npm start'
CMD ["sh", "-c", "node database/export-api.mjs && npm start"]
