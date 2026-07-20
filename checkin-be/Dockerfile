FROM node:20-alpine AS builder
WORKDIR /app

# Install ALL deps (including dev) for building
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate && npm run build

# --- Production stage ---
FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output and prisma client from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.js"]
