FROM node:20-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma GLIBC engine support
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# --- Production runner stage ---
FROM node:20-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.js"]
