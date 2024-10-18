# Developer Environment: Local

## Required Software

Install the following software on your local development machine:

1. git
2. Bash (this guide assumes a bash shell)
3. [vscode](https://code.visualstudio.com/Download)
4. [Docker](https://www.docker.com/products/docker-desktop/) (for Mongodb and MQTT dependencies)
5. [Node.js@>=22.5.0](https://nodejs.org/en/download/package-manager) (recommend using `nvm` to manage Node.js installations)
   - [nvm for OSX](https://github.com/nvm-sh/nvm)
   - [nvm for Windows](https://github.com/coreybutler/nvm-windows)
6. [yarn@^4.0.0](https://yarnpkg.com/getting-started)
   - With Node.js installed, run `corepack enable && corepack prepare --activate yarn@^4.0.0 && yarn set version berry`

## Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Clone your forked repo to your local development machine.
3. Open the repo in vscode.
4. Run `yarn`
5. Run `yarn nx run devenv:prepare`. This is only required for the first time working with the codebase.
6. Run `yarn run start` and navigate to [https://localhost:3000](https://localhost:3000)
   - Note that MQTT and Mongo will be started via docker automatically.
   - Mongo will restore a default database if no database already exists (if there are no files in `.data/mongodb`).
   - Note MQTT currently starts with no username/password configured.
7. \[Optional\]: override environment variables when running locally via `cp apps/playnite-web/local.env apps/playnite-web/overrides.env`
   - **REMEMBER: do not commit `overrides.env` or sensitive information in `local.env`.**
8. Continue to see [commands](./index.md#running-playnite-web) for running tests.
