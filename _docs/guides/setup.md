# Playnite Web Setup

- [Playnite Web Setup](#playnite-web-setup)
  - [Deployed Services Overview](#deployed-services-overview)
  - [Deployment](#deployment)
    - [MQTT Broker](#mqtt-broker)
    - [Database](#database)
      - [Mongo Data Volumes](#mongo-data-volumes)
    - [Playnite Web Plugin](#playnite-web-plugin)
    - [Playnite Web App](#playnite-web-app)
      - [App Data Volumes](#app-data-volumes)
      - [Environment Variables](#environment-variables)
  - [Post Deployment Steps](#post-deployment-steps)

## Deployed Services Overview

Playnite Web consists the following:

> All components are required.

| Component           | Deployment Mechanism              | Purpose                                                                                                        |
| :------------------ | :-------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| MQTT broker         | Docker image / bring your own     | Provides a communication mechanism between Playnite and Playnite Web.                                          |
| (game) database     | Docker image / bring your own     | Mongo DB database that stores game data in `games` database.                                                   |
| Playnite Web Plugin | Extension installed into Playnite | The plugin sends and receives messages via MQTT when data in Playnite is changed.                              |
| Playnite Web App    | Docker image                      | Syncs Playnite games to game database, web UI, and GraphQL API that may be used to power your own experiences. |

## Deployment

### MQTT Broker

Recommended to use docker image [`eclipse-mosquitto`](https://hub.docker.com/_/eclipse-mosquitto/). Things to note when deploying:

- IP/hostname used to access the broker
- Port
- Username (only if configured to disable anonymous access)
- Password (only if configured to disable anonymous access)

### Database

Recommended to use docker image [`mongo:focal`](https://hub.docker.com/_/mongo/). Things to note when deploying:

- Use/mount a persistent volume. See mongodb image documentation for more details.
- IP/hostname used to access the database
- Port
- Username (only if configured to disable anonymous access)
- Password (only if configured to disable anonymous access)

#### Mongo Data Volumes

Playnite Web synchronizes your Playnite library to the mongo database. There is currently no information that is stored that is not synced. For this reason, there is no need to mount a data volume; re-syncing will populate the database again.

### Playnite Web Plugin

1. Download the Playnite Web extension corresponding to the Playnite Web App image version. See [releases](https://github.com/andrew-codes/playnite-web/releases), the extension asset is named "Playnite Web Plugin".
2. Open Playnite and drag downloaded file into the Playnite. It should prompt to install the plugin.
3. <details><summary>Open the plugin's settings and enter the MQTT connection information to your MQTT broker.</summary>
      > ![Mqtt connection settings screenshot](docs/assets/images/mqtt-connection-screenshot.png)
   </details>
4. <details><summary>Open the plugin's settings and enter the a device ID and device name under Topics.</summary>
   > ![Topics settings screenshot](docs/assets/images/topics-screenshot.png)
   </details>

### Playnite Web App

Use the docker [packaged image](https://github.com/andrew-codes/playnite-web/pkgs/container/playnite-web-app). Ensure you are using the same release version as the Plugin (above). Example image: `ghcr.io/andrew-codes/playnite-web-app:1.0.0`.

> Using Docker Compose? Here's [some guidance](./docker-compose.md) on using Docker Compose.

#### App Data Volumes

Ensure you mount a volume to persist game assets, such as cover-art, backgrounds, and icons. The mount location within the running container should be `/opt/playnite-web-app/public/assets/asset-by-id`.

#### Environment Variables

Playnite Web is configured via environment variables. Below are all supported environment variables and their purpose.

> Note all environment variables are strings.

| Environment Variable | Value                                                                         | Required? | Example Value                                        | Notes                                                                                      |
| :------------------- | :---------------------------------------------------------------------------- | :-------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| PORT                 | Defaults to 3000                                                              | Required  | 3000                                                 | Port in which web application is accessible.                                               |
| HOST                 | Defaults to `localhost`                                                       |           | `games.mydomain.com`                                 | The domain name or IP address of the server running Playnite Web.                          |
| DISABLE_CSP          | `true` to disable content security policies; defaults to `false`              |           | `true`                                               | May be useful when accessing via local LAN only. Will negate other options: `CSP_ORIGINS`. |
| CSP_ORIGINS          | Origins in which images, styles, fonts, and scripts are allowed to be loaded. |           | `images.google.com,gameimages.domain.com`            | Multiple values may be provided via a comma-delimited string.                              |
| ADDITIONAL_ORIGINS   | Additional origins allowed to request graph API.                              |           | `mycustomservice.mydomain.com,service2.mydomain.com` | Multiple values may be provided via a comma-delimited string.                              |
| DB_HOST              | IP address/hostname of Mongo DB database                                      | Required  | `192.168.1.100`                                      |                                                                                            |
| DB_PORT              | Port of Mongo DB database                                                     |           | `27017`                                              | Default for MongoDB image is 27017                                                         |
| DB_USERNAME          | Username to access database                                                   |           | `mongoUser`                                          | Only required if disabled anonymous access                                                 |
| DB_PASSWORD          | Password to access database                                                   |           | `mongo password`                                     | Only required if disabled anonymous access                                                 |
| DB_URL               | MongoDB connection URL                                                        |           | `mongo` or IP such as `192.168.1.101`                | Alternative to individual DB connection options                                            |
| DEBUG                | `"playnite-web/*"`                                                            |           |                                                      | For troubleshooting; send logs to STDIO                                                    |
| USERNAME             |                                                                               |           | `username`                                           | Username used to login                                                                     |
| PASSWORD             |                                                                               |           | `playnite password`                                  | Password value used to login                                                               |
| SECRET               |                                                                               |           | `any randomly generated long string value`           | Secret used to protect credentials                                                         |
| MQTT_HOST            | IP address/hostname of MQTT broker.                                           | Required  | `mqtt` or an IP such as `192.168.1.102`              |                                                                                            |
| MQTT_PORT            | Port of MQTT broker                                                           |           | `1883`                                               | Default for MQTT image is 1883                                                             |
| MQTT_USERNAME        | Username to access MQTT broker                                                |           | `mqttUsername`                                       | Only required if disabled anonymous access                                                 |
| MQTT_PASSWORD        | Password to access MQTT broker                                                |           | `mqtt password`                                      | Only required if disabled anonymous access                                                 |

## Post Deployment Steps

1. Open Playnite and select and "Sync Library" from Playnite Web's menu setting. This is generally only required once. Future game updates in Playnite will automatically sync to Playnite Web.
   > ![Sync Library menu setting](docs/assets/images/sync-library-menu-setting.png)
1. Navigate to the web app; `http://$PLAYNITE_WEB_APP_IP:$PORT`
