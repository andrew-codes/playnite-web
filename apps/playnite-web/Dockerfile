FROM node:22-slim
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

RUN apk add \
  bash

WORKDIR /opt/playnite-web-app
RUN npm install --os=linux sharp

COPY _packaged/ .

ENTRYPOINT ["node server.production.js"]
