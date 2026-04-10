# Build stage
FROM node:20-alpine AS build
WORKDIR /app
# Install python and build tools for native modules like bcrypt
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
# Install only production dependencies to reduce image size
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Generate prisma client for production
RUN npx prisma generate

# Change ownership to non-root user for security
RUN chown -R node:node /app
USER node

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]