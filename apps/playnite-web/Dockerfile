# Build stage
FROM node:24-alpine3.20 AS builder

WORKDIR /opt/playnite-web-app
COPY _packaged/package.json ./
RUN npm install --force --omit=dev


# Runtime stage
FROM node:24-alpine3.20
LABEL org.opencontainers.image.source=https://github.com/andrew-codes/playnite-web

RUN apk add --no-cache \
  bash \
  libc6-compat

WORKDIR /opt/playnite-web-app

# Copy node_modules from the builder stage and the rest of the app files
COPY --from=builder /opt/playnite-web-app/node_modules ./node_modules
COPY _packaged/ .

WORKDIR /opt/playnite-web-app
ENV NODE_ENV=production

ENTRYPOINT ["node", "server.js"]
