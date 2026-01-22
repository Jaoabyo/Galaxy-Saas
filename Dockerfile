FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start command (dev mode for local testing to allow edits if mapped)
CMD ["npm", "run", "dev"]
