# Playnite-Web game-db-updater

This is not needed with when using Playnite-Web App. It is only available for users that want to capture and update their game database without using Playnite-Web.

**!!! DO NOT !!!** use both this and Playnite-Web App.

Use the docker [packaged image](https://github.com/andrew-codes/playnite-web/pkgs/container/playnite-web-game-db-updater) from the repo. Ensure you are using the same release version as the Plugin (above). Example image: `ghcr.io/andrew-codes/playnite-web-game-db-updater:1.0.0`

## Environment Variables

| Environment Variable | Value                                    | Notes                                                     |
| :------------------- | :--------------------------------------- | :-------------------------------------------------------- |
| MQTT_HOST            | IP address/hostname of MQTT broker.      |                                                           |
| MQTT_PORT            | Port of MQTT broker                      | Default for MQTT image is 1883                            |
| MQTT_USERNAME        | Username to access MQTT broker           | Optional, only required if disabled anonymous access      |
| MQTT_PASSWORD        | Password to access MQTT broker           | Optional, only required if disabled anonymous access      |
| DB_HOST              | IP address/hostname of Mongo DB database |                                                           |
| DB_PORT              | Port of Mongo DB database                | Default for MongoDB image is 27017                        |
| DB_USERNAME          | Username to access database              | Optional, only required if disabled anonymous access      |
| DB_PASSWORD          | Password to access database              | Optional, only required if disabled anonymous access      |
| DB_URL               | MongoDB connection URL                   | Optional, alternative to individual DB connection options |
| DEBUG                | `"playnite-web/game-db-updater/*"`       | Optional, for troubleshooting; send logs to STDIO         |
