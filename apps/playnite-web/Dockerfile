FROM node:20-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-app
COPY apps/playnite-web/package.json apps/playnite-web/package.json
COPY apps/playnite-web/_packaged/ ./apps/playnite-web/
COPY .yarn/install-state.gz .yarn/install-state.gz
COPY .pnp.cjs .pnp.loader.mjs yarn.lock package.json .yarnrc.yml ./

RUN corepack enable
RUN corepack prepare --activate yarn@^4.0.0
RUN yarn install

WORKDIR /opt/playnite-web-app/apps/playnite-web
ENTRYPOINT [ "yarn", "node", "server.mjs" ]
