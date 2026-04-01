# Base image
FROM node:20-alpine AS base

RUN apk add --no-cache dumb-init
WORKDIR /app

COPY services/auth-service/package*.json ./
RUN npm ci && npm cache clean --force

# 🔥 Build stage
FROM base AS builder

COPY shared ../shared
WORKDIR ../shared
RUN npm ci && npm cache clean --force

WORKDIR /app
COPY services/auth-service/ ./

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]