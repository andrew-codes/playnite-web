# How to Set Up Playnite Web

- [Overview](#overview)
- [Step 1 - Deployment](#step-1---deployment)
  - [Recommended Deployment (Docker-Compose)](#recommended-deployment-(docker-compose))
  - [Manual Deployment](#manual-deployment)
- [Step 2 - Load Playnite Web for First Time](#step-2---load-playnite-web-for-first-time)
- [Step 3 - Install the Playnite Web Plugin](#step-3---install-the-playnite-web-plugin)
- [Step 4 - Sync Your Games Library](#step-4---sync-your-games-library)

## Overview

Playnite Web consists of the following required components:

| Component              | Deployment Mechanism              | Purpose                                                                                                        |
| :--------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| **Playnite Web Plugin**    | Download and install to Playnite. | The plugin sends and receives messages via MQTT when data in Playnite is changed.                              |
| **Playnite Web App**       | Docker image                      | Syncs Playnite games to game database, web UI, and GraphQL API that may be used to power your own experiences. |
| **Sync Library Processor** | Docker image                      | Performs work to download asssets and update database for library syncs.                                       |
| **Postgres Database**      | Docker image OR Bring your own     | Stores synced data from Playnite and other Playnite Web settings/data.                                         |
| **MQTT Broker**            | Docker image OR Bring your own     | Communication bus between Playnite Web App and the Sync Library processor.                                     |

## Step 1 - Deployment

### Recommended Deployment (Docker-Compose)

For self-hosted users, we recommend you use Docker-compose. 

See [docker-compose.md](./docker-compose.md) for more info.

### Manual Deployment

For more advanced scenarios, you can deploy Playnite Web manually. 

See [manual-deployment.md](./manual-deployment.md) for more info.

## Step 2 - Load Playnite Web for First Time

> **Note:** For security, do not expose your Playnite Web instance to the internet until you complete this process.

When you load Playnite Web for the first time, you will create an account with administrator permissions to configure your instance:

1. Navigate to your Playnite Web instance URL, e.g., `http://$PLAYNITE_WEB_APP_IP:$PORT`. 
2. Follow to prompts to register a new user account. 

## Step 3 - Install the Playnite Web Plugin

To install the Playnite Web Plugin:

1. See [releases](https://github.com/andrew-codes/playnite-web/releases) to download the Playnite Web extension corresponding to your Playnite Web App version. The extension asset is named "Playnite Web Plugin".
2. Open Playnite and drag the downloaded file into the Playnite window. 
3. Follow the prompts to install the plugin.
4. Open the plugin settings and enter the connection information for your Playnite Web instance, including your registered username and password.
5. Optionally, provide a custom name for this Playnite instance. Playnite Web supports multiple Playnite instances per user. If you reinstall Windows and/or Playnite, you must use the same name when you reinstall the Playnite Web plugin.

## Step 4 - Sync Your Games Library

You only need to sync your games library manually once. After you sync it, future updates in Playnite will automatically sync to Playnite Web.

To manually sync your Playnite games library with Playnite Web:

1. Open the Playnite Settings menu. 
2. Select Extensions &rarr; Playnite Web &rarr; Sync Library.
   > ![Sync Library menu setting](../assets/images/sync-library-menu-setting.png)

Once you're done, you can access your games library by navigating to the web app; `http://$PLAYNITE_WEB_APP_IP:$PORT`
