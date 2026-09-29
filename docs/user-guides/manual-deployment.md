# Manual Deployment

- [Manual Deployment](#manual-deployment)
  - [Database](#database)
  - [MQTT Broker](#mqtt-broker)
  - [Playnite Web App](#playnite-web-app)
    - [Data Volumes](#data-volumes)
    - [Environment Variables](#environment-variables)
  - [Sync Library Processor](#sync-library-processor)
  - [Resume Setup Guide](#resume-setup-guide)

## Database

Recommended to use docker image [`postgres:13.22`](https://hub.docker.com/_/postgres). Things to note when deploying:

- Use/mount a persistent volume. See postgres image documentation for more details.
- IP/hostname used to access the database
- Port
- Username
- Password

## MQTT Broker

It is recommended to use the `eclipse-mosquitto:2.0.18` docker image. When configuring the container, note that persistence is not required and can be set to false in its configuration file. The [sample config file](./mosquitto.conf) can be used. Note it does not enable a username and password to access the MQTT broker.

Please read [its documentation](https://hub.docker.com/_/eclipse-mosquitto/) for further details.

## Playnite Web App

Use the docker [packaged image](https://github.com/andrew-codes/playnite-web/pkgs/container/playnite-web-app). Ensure you are using the same release version as the Playnite Web Plugin you install (see the [setup guide](./setup-guide.md#step-3---install-the-playnite-web-plugin)). Example images: `ghcr.io/andrew-codes/playnite-web-app:13-latest` (newest release of major version 13), `ghcr.io/andrew-codes/playnite-web-app:latest` or a specific version such as `ghcr.io/andrew-codes/playnite-web-app:13.10.4`.

The app migrates the database schema to the current version on startup. The database named in `DATABASE_URL` is created if it does not exist.

### Data Volumes

Ensure you mount a volume to persist game cover art. Set the `COVER_ART_PATH` environment variable to the location within the running container and mount the volume there, e.g. `COVER_ART_PATH=/opt/playnite-web-app/game-assets/cover-art`. The [Sync Library Processor](#sync-library-processor) writes cover art to this same location, so both containers must mount the same volume.

### Environment Variables

Playnite Web requires configured environment variables. Below are all supported environment variables and their purpose.

> Note all environment variables are strings.

| Environment Variable | Value                                                                         | Required? | Example Value                                                                      | Notes                                                                                              |
| :------------------- | :---------------------------------------------------------------------------- | :-------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| PORT                 | Defaults to `3000`                                                            |           | 3000                                                                               | Port in which web application is accessible.                                                       |
| HOST                 | Defaults to `localhost`                                                       |           | `games.mydomain.com`                                                               | The domain name or IP address of the server running Playnite Web.                                  |
| DATABASE_URL         |                                                                               | Required  | `postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/games?schema=public&pgbouncer=true` | Connection string for database. Replace `${DB_USER}` and `${DB_PASSWORD}` with appropriate values. |
| SECRET               |                                                                               | Required  | `any randomly generated long string value`                                         | Secret used to protect credentials .                                                               |
| DISABLE_CSP          | `true` to disable content security policies; defaults to `false`              |           | `true`                                                                             | May be useful when accessing via local LAN only. Will negate other options: `CSP_ORIGINS`.         |
| CSP_ORIGINS          | Origins in which images, styles, fonts, and scripts are allowed to be loaded. |           | `images.google.com,gameimages.domain.com`                                          | Multiple values may be provided via a comma-delimited string.                                      |
| ADDITIONAL_ORIGINS   | Additional origins allowed to request graph API.                              |           | `mycustomservice.mydomain.com,service2.mydomain.com`                               | Multiple values may be provided via a comma-delimited string.                                      |
| COVER_ART_PATH       | Defaults to `./game-assets/cover-art` (relative to the working directory)      |           | `/opt/playnite-web-app/game-assets/cover-art`                                      | Directory in which cover art is served from. Must match the Sync Library Processor.                |
| MQTT_HOST            |                                                                               | Required  | `localhost`                                                                        | Hostname for MQTT broker.                                                                          |
| MQTT_PORT            | Defaults to `1883`                                                            |           |                                                                                    | Port used to access MQTT broker.                                                                   |
| MQTT_USERNAME        |                                                                               |           |                                                                                    | Used when MQTT broker has been configured to require a username/password.                          |
| MQTT_PASSWORD        |                                                                               |           |                                                                                    | Used when MQTT broker has been configured to require a username/password.                          |

## Sync Library Processor

The Sync Library Processor downloads cover art and updates the database whenever your Playnite library is synced. It is required; without it, library syncs from Playnite will not appear in Playnite Web.

Use the docker [packaged image](https://github.com/andrew-codes/playnite-web/pkgs/container/sync-library-processor), using the same version as the Playnite Web App. Example image: `ghcr.io/andrew-codes/sync-library-processor:13-latest`.

| Environment Variable | Required? | Example Value                                                     | Notes                                                                      |
| :------------------- | :-------- | :---------------------------------------------------------------- | :------------------------------------------------------------------------- |
| PORT                 |           | `3001`                                                            | Defaults to `3001`.                                                        |
| DATABASE_URL         | Required  | `postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/games?schema=public` | Must point to the same database used by the Playnite Web App.              |
| MQTT_HOST            |           | `localhost`                                                       | Defaults to `localhost`. Must be the same broker used by the Playnite Web App. |
| MQTT_PORT            |           | `1883`                                                            | Defaults to `1883`.                                                        |
| MQTT_USERNAME        |           |                                                                   | Used when MQTT broker has been configured to require a username/password.  |
| MQTT_PASSWORD        |           |                                                                   | Used when MQTT broker has been configured to require a username/password.  |
| COVER_ART_PATH       | Required in containers | `/opt/playnite-web/game-assets/cover-art`            | Directory to write cover art to. Mount the same volume as the Playnite Web App uses for its `COVER_ART_PATH`. |

## Resume Setup Guide

Resume the [general setup guide](./setup-guide.md#step-2---load-playnite-web-for-first-time).
