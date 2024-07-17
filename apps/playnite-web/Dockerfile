FROM node:22-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-app
COPY _packaged/ .

ENTRYPOINT ["node", "server.production.js" ]
