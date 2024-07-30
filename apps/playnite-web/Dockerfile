FROM node:22-alpine3.19
LABEL org.opencontainers.image.source https://github.com/andrew-codes/playnite-web

WORKDIR /opt/playnite-web-app
COPY _packaged/ .
RUN npm install --cpu=x64 --os=linux --libc=musl sharp
RUN npm install --cpu=arm/v6 --os=linux --libc=musl sharp
RUN npm install --cpu=arm/v7 --os=linux --libc=musl sharp
RUN npm install --cpu=arm64 --os=linux --libc=musl sharp

ENTRYPOINT ["node", "server.production.js" ]
