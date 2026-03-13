FROM node:20-bullseye-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY dist ./dist
COPY public ./public
COPY private ./private
COPY src/database ./src/database
COPY .sequelizerc ./

EXPOSE 8081

CMD ["node", "dist/server.js"]
