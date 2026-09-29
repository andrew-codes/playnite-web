# Troubleshooting Playnite Web

This guide provides solutions to common problems that Playnite Web users encounter when using the plugin. If you're having trouble using the plugin, check here for a solution before opening an issue. 

## Docker Compose Deployment Fails or Library Does Not Sync

Most first-time deployment problems come from the items below. See the [docker compose guide](./docker-compose.md) for details.

### Solution

1. Confirm `DB_PASSWORD` and `APP_SECRET` are set in a `.env` file next to the compose file.
2. Create the MQTT config volume and configuration before first start (see [MQTT Configuration](./docker-compose.md#mqtt-configuration-critical)). If you enabled MQTT authentication, `MQTT_USERNAME` and `MQTT_PASSWORD` must match it.
3. Check all four services are running with `docker compose -f playnite-web.docker-compose.yaml ps` and read logs with `docker compose -f playnite-web.docker-compose.yaml logs playnite-web` (also `playnite-web-sync-library-processor`).
4. Use the same version for the docker images and the Playnite Web Plugin; e.g. `13-latest` images with a `13.x` plugin.
5. Game cover art missing: ensure the `playnite-web` and `playnite-web-sync-library-processor` services mount the same volume, and that `COVER_ART_PATH` matches the mount location in each.
6. If the web app is reached from another machine, set `APP_HOST` to the address you use in the browser, and use `ADDITIONAL_ORIGINS`/`CSP_ORIGINS` if you load it from other origins.

## I Discovered a Security Vulnerability 

If you discover a security vulnerability, it's important to let us know so that we can resolve it. However, sharing information about vulnerabilities publicly can make it possible for bad actors to take advantage of the vulnerability, exposing yourself and other users to potential harm. Because GitHub issues are public, you must submit the information as a security advisory for confidentiality. This will allow private communication between you and the respository maintainers. 

### Solution

1. **Do not** open an issue.
2. [Submit a security advisory on GitHub](https://github.com/andrew-codes/playnite-web/security/advisories/new).

## Can't Load Playnite Web After Upgrading Playnite to Version 12

After upgrading Playnite from version 11 to 12, you may receive an error message that the Playnite Web plugin can't be loaded. 

To resolve this issue, you need to manually delete a configuration file in the **Data** folder to remove some incompatible settings values left over from the old version of the plugin. The **Data** folder is the directory that stores your settings for Playnite Web. 

### Solution

1. Run Playnite and open the add-ons view. 
2. Navigate to Playnite Web and select the **Data** folder. 
3. Leave the **Data** folder open in Windows Explorer and completely close Playnite. 
4. Delete the file named **config.json**.
5. Open Playnite and re-apply your Playnite Web settings. 