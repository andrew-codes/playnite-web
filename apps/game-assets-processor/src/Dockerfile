# Build stage
FROM node:22-alpine3.20 AS builder
RUN apk add --no-cache \
  vips-dev \
  pkgconfig \
  build-base \
  python3 \
  make \
  g++ \
  libc6-compat

WORKDIR /opt/playnite-web
COPY _packaged/ .
RUN npm install --force --omit=dev

# Runtime stage
FROM node:22-alpine3.20
LABEL org.opencontainers.image.source=https://github.com/andrew-codes/playnite-web

RUN apk add --no-cache \
  bash \
  vips

WORKDIR /opt/playnite-web

# Copy the built application from the builder stage
COPY --from=builder /opt/playnite-web .

ENV NODE_ENV=production

ENTRYPOINT ["node", "server.js"]
