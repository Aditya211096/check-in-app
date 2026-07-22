# checkin-be/Dockerfile

# =========================================================
# Stage 1: Dependency Installation & Compilation Builder
# =========================================================
FROM node:20-slim AS builder

WORKDIR /app

# Install system utilities required for Prisma compilation
RUN apt-get update && apt-get install -y openssl openssl-data && rm -rf /var/lib/apt/lists/*

# Install project packages
COPY package*.json ./
RUN npm ci

# Copy configuration schemas
COPY prisma ./prisma/

# Satisfy Prisma generate checks during build phase with a dummy database URL
ARG DIRECT_URL="postgresql://placeholder_user:placeholder_password@localhost:5432/placeholder_db"
ENV DIRECT_URL=${DIRECT_URL}

# Compile type-safe database clients
RUN npx prisma generate

# Copy codebase files and run compilation
COPY . .
RUN npm run build

# Remove development-only dependencies to reduce container footprint
RUN npm prune --production

# =========================================================
# Stage 2: Production Execution Runtime
# =========================================================
FROM node:20-slim AS runner

WORKDIR /app

# Ensure system dependencies are secure and up-to-date
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy production assets and runtime libraries from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

ENV PORT=8080
ENV NODE_ENV=production

# Run container as a non-root system user
USER node

# Start the NestJS runtime using direct Node execution
CMD ["node", "dist/main.js"]
