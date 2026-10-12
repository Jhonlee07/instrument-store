
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install


FROM deps AS test
COPY . .
RUN npm test


FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
