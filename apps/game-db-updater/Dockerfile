FROM node:20-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-game-db-updater
COPY _packaged/ .

ENTRYPOINT [ "node", "index.js" ]
