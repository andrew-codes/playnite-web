# Build stage
FROM node:24-alpine3.20 AS builder

WORKDIR /opt/playnite-web
COPY _packaged/ .
RUN npm install --force --omit=dev

# Runtime stage
FROM node:24-alpine3.20
LABEL org.opencontainers.image.source=https://github.com/andrew-codes/playnite-web

RUN apk add --no-cache \
  bash

WORKDIR /opt/playnite-web

# Copy the built application from the builder stage
COPY --from=builder /opt/playnite-web .

ENV NODE_ENV=production

ENTRYPOINT ["node", "server.js"]
