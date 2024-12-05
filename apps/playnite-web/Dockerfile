FROM node:22-alpine3.20
LABEL org.opencontainers.image.source=https://github.com/andrew-codes/playnite-web

RUN apk add \
  bash

WORKDIR /opt/playnite-web-app

COPY _packaged/ .

RUN npm install --force --omit=dev

WORKDIR /opt/playnite-web-app/src/server

ENTRYPOINT ["node", "server.js"]
