# Playnite Web <img alt="Playnite Web logo" src="./docs/assets/images/logo.png" style="margin-bottom:-10px;" />

[![Release Status](https://github.com/andrew-codes/playnite-web/actions/workflows/publish-release.yml/badge.svg)](https://github.com/andrew-codes/playnite-web/actions/workflows/publish-release.yml)
[![Latest Release](https://img.shields.io/github/v/release/andrew-codes/playnite-web)](https://github.com/andrew-codes/playnite-web/releases/latest)
[![License](https://img.shields.io/github/license/andrew-codes/playnite-web)](https://github.com/andrew-codes/playnite-web?tab=AGPL-3.0-1-ov-file#readme)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/andrew-codes)](https://github.com/sponsors/andrew-codes)
[![Discord](https://img.shields.io/discord/1432357177984684102?style=flat&label=Discord%20Community)](https://discord.gg/Dv8UrQ6mGb)

- [Playnite Web ](#playnite-web-)
  - [About](#about)
  - [Components](#components)
  - [Setup Overview](#setup-overview)
  - [Get Started](#get-started)

## About

Share, automate, and remotely control your entire game library online with self-hosted Playnite Web.

Playnite Web offers:

- A beautiful web UI for your Playnite library to share with friends.
- A secure login screen for accessing your Playnite Web App instance.
- The ability to remotely start and stop your games.
- A graph API to help you build your own unique experiences.

![Browse screenshot](./docs/assets/images/browse-screenshot.png)

## Components

Playnite Web has two main components:

- Playnite Web App - A self-hosted web server to sync and access your games library.
- Playnite Web Plugin - A plugin that connects Playnite to the Playnite Web App to send and receive data.

The Playnite Web App has three dependencies required to run the server, included in the Playnite Web package:

- Game Assets Processor - Processes assets for synced games, for example, cover art.
- MQTT Broker - Communicates between the Playnite Web App and the Game Assets Processor.
- Postgres Database - Stores synced game library data and Playnite Web settings.

## Setup Overview

> **Note:** For detailed setup instructions, read the [setup guide](./docs/user-guides/setup-guide.md).

1. Configure and deploy the Playnite Web App.
2. Create account credentials for accessing your Playnite Web App instance.
3. Download and install the Playnite Web Plugin.
4. Configure the plugin by entering your Playnite Web App URL and credentials.
5. Sync your game library.

## Get Started

1. For detailed instructions about setting up Playnite Web, read the [setup guide](./docs/user-guides/setup-guide.md).
2. If you encounter a problem, check the [troubleshooting guide](./docs/user-guides/troubleshooting-guide.md) for a solution before you open an issue on GitHub.
3. If you discover a security vulnerability, **do not open an issue**, instead [submit a security advisory via GitHub](https://github.com/andrew-codes/playnite-web/security/advisories/new).
4. To get started with the Playnite Web API, read about the [data model](./docs/api-documentation/data-model.md).
5. Before you contribute, read the [contribution guidelines](./docs/CONTRIBUTING.md).
6. For help with the local development environment, see the [local development environment](./docs/contributor-guides/development-environment/index.md) guide.
