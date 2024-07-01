# Development Environment

- [Development Environment](#development-environment)
  - [Overview](#overview)
  - [Setup: Devcontainer (preferred)](#setup-devcontainer-preferred)
    - [Devcontainer: Required Software](#devcontainer-required-software)
    - [Devcontainer: Preparing Codebase](#devcontainer-preparing-codebase)
  - [Setup: Directly on Local Machine](#setup-directly-on-local-machine)
    - [Directly: Required Software](#directly-required-software)
    - [Directly: Preparing Codebase](#directly-preparing-codebase)
  - [Running Locally](#running-locally)

## Overview

There are a few options for running Playnite-Web for local development. The options are:

- via Docker and the included dev container (includes everything you need to run and develop).
- directly on your development machine (requires installing required tooling such as Node.js, yarn, etc.).
- via a GitHub codespace.

## Setup: Devcontainer (preferred)

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

## Setup: Directly on Local Machine

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
7. MQTT server (optional, only used for updating game db from Plugin or publishing commands for remote control).
   - recommend [Eclipse Mosquitto](https://mosquitto.org/) Docker image.
8. MongoDB `games` database.
   - recommend using a Docker image.
   - repo contains seed data for a sample games database and can be restored via `mongorestore --nsInclude games.* ./.data/games`
     - or use the below snippet if running via Docker:

```bash
# Run from root of repo

# Source local env vars from ./local.env
set -o allexport
. local.env
set +o allexport

# Determine if sample data is needed to be installed
mongoDataExists=$(ls .data/mongodb | wc -l)
mkdir -p /.data/mongodb
# Run the docker container and mount local volumes for database data; including backup to restore.
docker run --name playnite-web-db -d \
  --network host \
  -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME \
  -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD \
  -v $PWD/.data/mongodb:/data/db \
  -v $PWD/.data/games:/data/backup/games \
  mongo:7.0.3-jammy
# Restore only if database data did not already exist.
if [ $mongoDataExists -eq 0 ]; then
  docker exec -t playnite-web-db mongorestore --nsInclude games.* /data/backup
fi
```

### Directly: Preparing Codebase

1. [Fork the playnite-web repo](https://github.com/andrew-codes/playnite-web/fork)
2. Clone your forked repo to your local development machine.
3. Open the repo in vscode.
4. Run `yarn`
5. Ensure MQTT is running
6. Ensure database is running

## Running Locally

| Application      | Command                                                      | Notes                                                                                                                                                                                    |
| :--------------- | :----------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playnite-Web App | `yarn nx run playnite-web-app:start`                         | Run Playnite-Web application locally. Navigate to [http://localhost:3000](http://localhost:3000) in a browser. Environment variables are pulled from `./apps/game-db-updater/local.env`. |
| Playnite-Web App | `yarn nx run playnite-web-app:test/components`               | Run component tests for development.                                                                                                                                                     |
| Playnite-Web App | `yarn nx run playnite-web-app:test/components/visual`        | Run visual regression component tests for development.                                                                                                                                   |
| Playnite-Web App | `yarn nx run playnite-web-app:test/components/visual/update` | Run visual regression tests with intention to update a baseline screenshot.                                                                                                              |
| Playnite-Web App | `yarn nx run playnite-web-app:test/e2e`                      | Run end-to-end (e2e) tests for development.                                                                                                                                              |
| Playnite-Web App | `yarn nx run playnite-web-app:test/**/ci`                    | Suffix any test target with `/ci` to run the tests in CI mode; the same as what is run in CI.                                                                                            |
