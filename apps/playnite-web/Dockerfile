FROM node:22-alpine3.20
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

RUN apk add --update --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/edge/community \
  vips-dev

RUN apk add \
  bash

WORKDIR /opt/playnite-web-app
RUN npm install sharp

COPY _packaged/ .

ENTRYPOINT ["node server.production.js"]
