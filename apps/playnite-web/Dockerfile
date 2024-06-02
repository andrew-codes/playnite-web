FROM node:20-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-app
COPY _packaged/ .

RUN corepack enable
RUN corepack prepare --activate yarn@^4.0.0

ENTRYPOINT ["node", "server.mjs" ]
