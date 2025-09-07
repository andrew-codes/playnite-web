[**playnite-web-app**](../../README.md)

---

[playnite-web-app](../../README.md) / guides/setup

# Playnite Web Setup

- [Playnite Web Setup](#playnite-web-setup)
  - [Deployed Services Overview](#deployed-services-overview)
  - [Deployment](#deployment)
    - [Database](#database)
    - [Playnite Web App](#playnite-web-app)
      - [App Data Volumes](#app-data-volumes)
      - [Environment Variables](#environment-variables)
      - [Loading Playnite Web for First Time](#loading-playnite-web-for-first-time)
    - [Playnite Web Plugin](#playnite-web-plugin)
  - [Post Deployment Steps](#post-deployment-steps)

## Deployed Services Overview

Playnite Web consists the following:

> All components are required.

| Component           | Deployment Mechanism              | Purpose                                                                                                        |
| :------------------ | :-------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Postgres Database   | Docker image / bring your own     | Stores synced data from Playnite and other Playnite Web settings/data.                                         |
| Playnite Web Plugin | Extension installed into Playnite | The plugin sends and receives messages via MQTT when data in Playnite is changed.                              |
| Playnite Web App    | Docker image                      | Syncs Playnite games to game database, web UI, and GraphQL API that may be used to power your own experiences. |

## Deployment

### Database

Recommended to use docker image [`postgres:13.22`](https://hub.docker.com/_/postgres). Things to note when deploying:

- Use/mount a persistent volume. See postgres image documentation for more details.
- IP/hostname used to access the database
- Port
- Username
- Password

### Playnite Web App

Use the docker [packaged image](https://github.com/andrew-codes/playnite-web/pkgs/container/playnite-web-app). Ensure you are using the same release version as the Plugin (above). Example image: `ghcr.io/andrew-codes/playnite-web-app:1.0.0`.

> Using Docker Compose? Here's [some guidance](docker-compose.md) on using Docker Compose.

#### App Data Volumes

Ensure you mount a volume to persist game assets, such as cover-art, backgrounds, and icons. The mount location within the running container should be `/opt/playnite-web-app/src/public/assets/game-assets`.

#### Environment Variables

Playnite Web requires configured environment variables. Below are all supported environment variables and their purpose.

> Note all environment variables are strings.

| Environment Variable | Value                                                                         | Required? | Example Value                                                            | Notes                                                                                      |
| :------------------- | :---------------------------------------------------------------------------- | :-------- | :----------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| PORT                 | Defaults to 3000                                                              | Required  | 3000                                                                     | Port in which web application is accessible.                                               |
| HOST                 | Defaults to `localhost`                                                       |           | `games.mydomain.com`                                                     | The domain name or IP address of the server running Playnite Web.                          |
| DISABLE_CSP          | `true` to disable content security policies; defaults to `false`              |           | `true`                                                                   | May be useful when accessing via local LAN only. Will negate other options: `CSP_ORIGINS`. |
| CSP_ORIGINS          | Origins in which images, styles, fonts, and scripts are allowed to be loaded. |           | `images.google.com,gameimages.domain.com`                                | Multiple values may be provided via a comma-delimited string.                              |
| ADDITIONAL_ORIGINS   | Additional origins allowed to request graph API.                              |           | `mycustomservice.mydomain.com,service2.mydomain.com`                     | Multiple values may be provided via a comma-delimited string.                              |
| DATABASE_URL         | Postgres database connection string.                                          | Required  | `postgresql://db_username:db_password@db_host:5432/games?schema=public"` |                                                                                            |
| SECRET               |                                                                               |           | `any randomly generated long string value`                               | Secret used to protect credentials                                                         |

#### Loading Playnite Web for First Time

This will prompt you to register a local account. The account is considered a site admin, with permissions to configure the Playnite Web instance.

### Playnite Web Plugin

1. Download the Playnite Web extension corresponding to the Playnite Web App image version. See [releases](https://github.com/andrew-codes/playnite-web/releases), the extension asset is named "Playnite Web Plugin".
2. Open Playnite and drag downloaded file into the Playnite. It should prompt to install the plugin.
3. Open the plugin's settings and enter the connection information to your Playnite Web instance; including your registered username and password.
4. Note you can provide a custom name for this Playnite instance. Playnite Web supports multiple Playnite instances per user. **NOTE**, if you reinstall Windows and/or Playnite, ensure you use the same name for when you re-install Playnite Web plugin.

## Post Deployment Steps

1. Open Playnite and select and "Sync Library" from Playnite Web's menu setting. This is generally only required once. Future game updates in Playnite will automatically sync to Playnite Web.
   > ![Sync Library menu setting](../assets/images/sync-library-menu-setting.png)
1. Navigate to the web app; `http://$PLAYNITE_WEB_APP_IP:$PORT`
