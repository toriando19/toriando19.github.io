# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Install dependencies
RUN npm install

# Ensure scripts are executable and run them
CMD ["sh", "-c", "node database/mongo/export-mongo.mjs && node database/postgres/export-postgres.mjs"]
