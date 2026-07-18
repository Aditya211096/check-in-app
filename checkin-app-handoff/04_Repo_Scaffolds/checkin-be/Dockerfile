FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
ENV NODE_ENV=production PORT=4000
EXPOSE 4000
CMD ["node", "dist/main.js"]
