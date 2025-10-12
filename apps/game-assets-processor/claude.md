# Project: Game Assets Processors

## Description

Node.js application that listens for messages from a running MQTT instance to process game related images, such as cover art. Messages contain the release information for the game. The game title is used to lookup details from IGN's GraphQL API. One field is the cover art URL. This application takes this URL, downloads the image from IGN, resize, and convert to webp format. Assets are stored in a shared volume between the web app and this application.

## Tech Stack

- No front-end.
- Backend: Node.js, connects to MQTT via async-mqtt package

## Code Conventions

## Project Structure

- `x__integration_tests__` - Jest integration/e2e tests, requires running the application.
- scripts - TypeScript files run with `tsx` used by Nx targets
- src
  - server.ts - entrypoint for the service
