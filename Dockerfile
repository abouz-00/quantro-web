FROM node:20-alpine

# Install dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client (in case it wasn't generated in postinstall)
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
