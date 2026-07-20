FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate && npm run build
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.js"]
