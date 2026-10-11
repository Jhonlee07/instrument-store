# ---- deps: full install (used by the test stage) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# ---- test: `docker build --target test ./backend` fails if any unit test fails ----
FROM deps AS test
COPY . .
RUN npm test

# ---- production: runtime image (default target) ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 3000
USER node
CMD ["node", "server.js"]
