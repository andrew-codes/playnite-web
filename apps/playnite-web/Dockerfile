FROM node:20-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-app
COPY _packaged/ .

RUN npm install --omit=dev

ENTRYPOINT ["node", "server.mjs" ]
