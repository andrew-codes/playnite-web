FROM node:22-alpine3.20
LABEL org.opencontainers.image.source=https://github.com/andrew-codes/playnite-web

RUN apk add \
  bash

WORKDIR /opt/playnite-web-app
RUN npm install sharp@0.33.4 mongodb@6.8.0

COPY _packaged/ .
RUN chmod +x server.production.js

ENTRYPOINT ["node", "server.production.js"]
