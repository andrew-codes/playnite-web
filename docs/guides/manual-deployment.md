# Manual Deployment

- [Manual Deployment](#manual-deployment)
  - [Database](#database)
  - [MQTT Broker](#mqtt-broker)
  - [Playnite Web App](#playnite-web-app)
    - [Data Volumes](#data-volumes)
    - [Environment Variables](#environment-variables)
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

Use the docker [packaged image](https://github.com/andrew-codes/playnite-web/pkgs/container/playnite-web-app). Ensure you are using the same release version as the Plugin (above). Example image: `ghcr.io/andrew-codes/playnite-web-app:12`.

### Data Volumes

Ensure you mount a volume to persist game assets, such as cover-art, backgrounds, and icons. The mount location within the running container should be `/opt/playnite-web-app/.next/static/media/game-assets`.

### Environment Variables

Playnite Web requires configured environment variables. Below are all supported environment variables and their purpose.

> Note all environment variables are strings.

| Environment Variable | Value                                                                         | Required? | Example Value                                                                      | Notes                                                                                              |
| :------------------- | :---------------------------------------------------------------------------- | :-------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| PORT                 | Defaults to `3000`                                                            |           | 3000                                                                               | Port in which web application is accessible.                                                       |
| HOST                 | Defaults to `localhost`                                                       |           | `games.mydomain.com`                                                               | The domain name or IP address of the server running Playnite Web.                                  |
| DATABASE_URL         |                                                                               | Required  | `postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432?schema=public&pgbouncer=true` | Connection string for database. Replace `${DB_USER}` and `${DB_PASSWORD}` with appropriate values. |
| SECRET               |                                                                               | Required  | `any randomly generated long string value`                                         | Secret used to protect credentials .                                                               |
| DISABLE_CSP          | `true` to disable content security policies; defaults to `false`              |           | `true`                                                                             | May be useful when accessing via local LAN only. Will negate other options: `CSP_ORIGINS`.         |
| CSP_ORIGINS          | Origins in which images, styles, fonts, and scripts are allowed to be loaded. |           | `images.google.com,gameimages.domain.com`                                          | Multiple values may be provided via a comma-delimited string.                                      |
| ADDITIONAL_ORIGINS   | Additional origins allowed to request graph API.                              |           | `mycustomservice.mydomain.com,service2.mydomain.com`                               | Multiple values may be provided via a comma-delimited string.                                      |
| MQTT_HOST            |                                                                               | Required  | `localhost`                                                                        | Hostname for MQTT broker.                                                                          |
| MQTT_PORT            | Defaults to `1883`                                                            |           |                                                                                    | Port used to access MQTT broker.                                                                   |
| MQTT_USERNAME        |                                                                               |           |                                                                                    | Used when MQTT broker has been configured to require a username/password.                          |
| MQTT_PASSWORD        |                                                                               |           |                                                                                    | Used when MQTT broker has been configured to require a username/password.                          |

## Resume Setup Guide

Resume the [general setup guide](./setup.md#loading-playnite-web-for-first-time).
