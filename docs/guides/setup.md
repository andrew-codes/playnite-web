# Playnite Web Setup

- [Playnite Web Setup](#playnite-web-setup)
  - [Deployed Services Overview](#deployed-services-overview)
  - [Services Deployment](#services-deployment)
    - [Recommended Deployment](#recommended-deployment)
    - [Manual Deployment](#manual-deployment)
  - [Loading Playnite Web for First Time](#loading-playnite-web-for-first-time)
  - [Playnite Web Plugin](#playnite-web-plugin)
  - [Post Deployment Steps](#post-deployment-steps)

## Deployed Services Overview

Playnite Web consists the following:

> All components are required.

| Component             | Deployment Mechanism              | Purpose                                                                                                        |
| :-------------------- | :-------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Playnite Web Plugin   | Extension installed into Playnite | The plugin sends and receives messages via MQTT when data in Playnite is changed.                              |
| Playnite Web App      | Docker image                      | Syncs Playnite games to game database, web UI, and GraphQL API that may be used to power your own experiences. |
| Game assets processor | Docker image                      | Processes synced items' cover art; downloading from IGN and optimizing size and format (.webp images).         |
| Postgres Database     | Docker image / bring your own     | Stores synced data from Playnite and other Playnite Web settings/data.                                         |
| MQTT broker           | Docker image / bring your own     | Communication bus between Playnite Web App and the Game assets processor.                                      |

## Services Deployment

### Recommended Deployment

For self-hosted users, it is recommended to use Docker-compose. Read the [guide](./docker-compose.md) for more information.

### Manual Deployment

For more advanced deployment scenarios, read the [manual deployment guide](./manual-deployment.md) for more details.

## Loading Playnite Web for First Time

> Do not expose your instance to the Web until this step has been completed.

Navigate to your Playnite instance URL, e.g., `http://$PLAYNITE_WEB_APP_IP:$PORT`. You will be prompted to register a user account. The account is considered a site admin, with permissions to configure the Playnite Web instance.

## Playnite Web Plugin

1. Download the Playnite Web extension corresponding to the Playnite Web App image version. See [releases](https://github.com/andrew-codes/playnite-web/releases), the extension asset is named "Playnite Web Plugin".
2. Open Playnite and drag downloaded file into the Playnite. It should prompt to install the plugin.
3. Open the plugin's settings and enter the connection information to your Playnite Web instance; including your registered username and password.
4. Note you can provide a custom name for this Playnite instance. Playnite Web supports multiple Playnite instances per user. **NOTE**, if you reinstall Windows and/or Playnite, ensure you use the same name for when you re-install Playnite Web plugin.

## Post Deployment Steps

1. Open Playnite and select and "Sync Library" from Playnite Web's menu setting. This is generally only required once. Future game updates in Playnite will automatically sync to Playnite Web.
   > ![Sync Library menu setting](../assets/images/sync-library-menu-setting.png)
1. Navigate to the web app; `http://$PLAYNITE_WEB_APP_IP:$PORT`
