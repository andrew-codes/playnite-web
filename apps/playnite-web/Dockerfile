FROM node:20-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-app
COPY .packaged/ .
RUN ls -al

RUN corepack enable
RUN corepack prepare --activate yarn@^4.0.0
RUN yarn install

ENTRYPOINT [ "yarn", "node", "server.mjs" ]
