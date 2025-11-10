# Project: Sync Library Processor

## Description

Node.js application that listens for messages from a running MQTT instance to process library syncs from Playnite Web.

## Tech Stack

- No front-end.
- Backend: Node.js, connects to MQTT via async-mqtt package
- Database: Postgres, connects via db-client Prisma client

## Code Conventions

## Project Structure

- `x__integration_tests__` - Jest integration/e2e tests, requires running the application.
- scripts - TypeScript files run with `tsx` used by Nx targets
- src
  - server.ts - entrypoint for the service
