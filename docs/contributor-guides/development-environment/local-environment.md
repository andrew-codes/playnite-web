# Developer Environment: Local

## Required Software

Install the following software on your local development machine:

1. git
2. Bash (this guide assumes a bash shell)
3. [vscode](https://code.visualstudio.com/Download)
4. [Docker](https://www.docker.com/products/docker-desktop/) (for Postgres and MQTT dependencies)
5. [Node.js@24.12.0](https://nodejs.org/en/download/package-manager) (recommend using `nvm` to manage Node.js installations)
   - [nvm for OSX](https://github.com/nvm-sh/nvm)
   - [nvm for Windows](https://github.com/coreybutler/nvm-windows)
6. [yarn@4.12.0](https://yarnpkg.com/getting-started)
   - With Node.js installed, run `corepack enable && corepack prepare --activate yarn` in the repo directory.

## Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Clone your forked repo to your local development machine.
3. Open the repo in vscode.
4. Run `yarn`
5. Run `yarn nx run dev-services:prepare`. This is only required for the first time working with the codebase.
6. Run `yarn nx run playnite-web-app:start` and navigate to [http://localhost:3000](http://localhost:3000)
   - Note an empty games database will be started automatically via Docker.
   - Populate a database from a previously created snapshot via `yarn nx run playnite-web-app:db/use-snapshot`.
7. \[Optional\]: override environment variables when running locally via `cp apps/playnite-web/.env.local apps/playnite-web/overrides.env`
   - **REMEMBER: do not commit `overrides.env` or sensitive information in `.env.local`.**
8. Continue to see [commands](./index.md#running-applicationservices) for running tests.
