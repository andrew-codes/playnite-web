# Development Environment

- [Development Environment](#development-environment)
  - [Overview](#overview)
  - [Setup: Directly on Local Machine (preferred)](#setup-directly-on-local-machine-preferred)
    - [Directly: Required Software](#directly-required-software)
    - [Directly: Preparing Codebase](#directly-preparing-codebase)
  - [Running Locally](#running-locally)
  - [Setup: Devcontainer (milage may vary)](#setup-devcontainer-milage-may-vary)
    - [Devcontainer: Required Software](#devcontainer-required-software)
    - [Devcontainer: Preparing Codebase](#devcontainer-preparing-codebase)

## Overview

There are a few options for running Playnite-Web for local development. The options are:

- via Docker and the included dev container (includes everything you need to run and develop).
- directly on your development machine (requires installing required tooling such as Node.js, yarn, etc.).
- via a GitHub codespace.

## Setup: Directly on Local Machine (preferred)

### Directly: Required Software

Install the following software on your local development machine:

1. git
2. Bash (this guide assumes a bash shell)
3. [vscode](https://code.visualstudio.com/Download)
4. [Docker](https://www.docker.com/products/docker-desktop/) (for Mongodb and MQTT dependencies)
5. [Node.js@>=20.9.0](https://nodejs.org/en/download/package-manager) (recommend using `nvm` to manage Node.js installations)
   - [nvm for OSX](https://github.com/nvm-sh/nvm)
   - [nvm for Windows](https://github.com/coreybutler/nvm-windows)
6. [yarn@^4.0.0](https://yarnpkg.com/getting-started)
   - With Node.js installed, run `corepack enable && corepack prepare --activate yarn@^4.0.0 && yarn set version berry`

### Directly: Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Clone your forked repo to your local development machine.
3. Open the repo in vscode.
4. Run `yarn`
5. Run `yarr nx run playnite-web-app:start` and navigate to [http://localhost:3000](http://localhost:3000)
   - Note that MQTT and Mongo will be started via docker automatically.
   - Mongo will restore a default database if no database already exists (if there are no files in `.data/mongodb`).
   - Note MQTT currently starts with no username/password configured.

## Running Locally

| Application      | Command                                                      | Notes                                                                                                                                                                                                      |
| :--------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playnite-Web App | `yarn nx run playnite-web-app:start`                         | Run Playnite-Web application locally. Navigate to [http://localhost:3000](http://localhost:3000) in a browser. Environment variables are pulled from `./apps/game-db-updater/local.env`.                   |
| Playnite-Web App | `yarn nx run playnite-web-app:test/components`               | Run component tests for development.                                                                                                                                                                       |
| Playnite-Web App | `yarn nx run playnite-web-app:test/components/visual`        | Run visual regression component tests for development.                                                                                                                                                     |
| Playnite-Web App | `yarn nx run playnite-web-app:test/components/visual/update` | Run visual regression tests with intention to update a baseline screenshot.                                                                                                                                |
| Playnite-Web App | `yarn nx run playnite-web-app:test/e2e`                      | Run end-to-end (e2e) tests for development (including visual regression capabilities). A consistent database restored along with consistent game assets. This ensures a reliable data set to test against. |
| Playnite-Web App | `yarn nx run playnite-web-app:test/e2e/update`               | Run end-to-end (e2e) tests with intention to update a baseline screenshot.                                                                                                                                 |
| Playnite-Web App | `yarn nx run playnite-web-app:test/**/ci`                    | Suffix any test target with `/ci` to run the tests in CI mode; the same as what is run in CI.                                                                                                              |

## Setup: Devcontainer (milage may vary)

### Devcontainer: Required Software

Install the following software on your local development machine:

1. git
2. Bash (this guide assumes a bash shell)
3. [vscode](https://code.visualstudio.com/Download)
4. [Docker](https://www.docker.com/products/docker-desktop/)
5. vscode [Devcontainers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
6. XServer (for running Cypress tests in container).
   - For OSX, recommend: [XQuartz](https://www.bing.com/ck/a?!&&p=c21da4f99329c03fJmltdHM9MTcxODg0MTYwMCZpZ3VpZD0zOTJjZTBlOC1iMzRjLTY3Y2MtMDU4NC1mM2NkYjI2MDY2NjUmaW5zaWQ9NTIyNw&ptn=3&ver=2&hsh=3&fclid=392ce0e8-b34c-67cc-0584-f3cdb2606665&psq=xquartz+&u=a1aHR0cHM6Ly93d3cueHF1YXJ0ei5vcmcv&ntb=1)
   - For Windows, still need a recommendation.

### Devcontainer: Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Clone your forked repo to your local development machine.
3. Open the repo in vscode.
4. Run `yarn`
5. Ensure your XServer application is running (if running Cypress tests).
   - Ensure your XServer is configured to Authenticate and Allow Connections from network clients
6. Once in vscode, Devcontainers: Rebuild and Reopen in container.
   - This can be done via the command palette (`Cmd + Shift + P`/`Ctrl + Shift + P`) and typing in `Rebuild and reopen in container`.
   - This will build a docker image based on the repo's `.devcontainer/Dockerfile`, start, and then open the repo in that container.

Note that MongoDB and Mosquitto (MQTT) are already setup and installed for localhost when using a devcontainer. See the `./local.env` file for their connection details.
