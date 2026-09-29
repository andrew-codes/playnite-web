# Playnite Web MQTT Plugin Guide

- [Playnite Web MQTT Plugin Guide](#playnite-web-mqtt-plugin-guide)
  - [Overview](#overview)
  - [Requirements](#requirements)
  - [Installing the plugin](#installing-the-plugin)
  - [Configuring the Playnite extension](#configuring-the-playnite-extension)
    - [Connection](#connection)
    - [Library management](#library-management)
  - [Connecting Playnite Web to your automation stack](#connecting-playnite-web-to-your-automation-stack)
  - [MQTT release control topics](#mqtt-release-control-topics)
  - [Example automation flow](#example-automation-flow)
  - [Troubleshooting tips](#troubleshooting-tips)

## Overview

The Playnite Web MQTT plugin bridges your self-hosted Playnite Web instance and a local Playnite client so that you can trigger Playnite game actions from anywhere on your network. The plugin listens for those MQTT topics and executes the matching action inside Playnite allowing dashboards, voice assistants, or other tooling to remotely control your library. Combined with Playnite Web and an automation system such as Home Assistant, Playnite Web is transformed into your game library, home automation remote control. This article covers a recommended use case.

## Requirements

Before installing the plugin, make sure you have the following pieces running:

- A self-hosted Playnite Web instance.
- A MQTT broker reachable from both Playnite Web and the machine running Playnite. You can re-use the same broker used by Playnite Web.
- A webhook endpoint or lightweight service that relays Playnite Web's action webhooks into MQTT messages. This can be Home Assistant, Node-RED, or a short script built with the language of your choice.
- Administrative access to your Playnite client so that you can install extensions.

## Installing the plugin

The MQTT plugin is a second, discreet Playnite extension to be installed in Playnite. Download the [latest Playnite Web release](https://github.com/andrew-codes/playnite-web/releases/latest). This is a zip file containing both the Playnite Web and Playnite Web MQTT plugins. Import the plugin it into Playnite just like any other extension.

1. Download the desired `.pext` file.
2. Open Playnite and choose **Add-ons** → **Browse...**.
3. Select the downloaded archive and confirm the installation.
4. Restart Playnite so that the plugin can initialize its background services.

## Configuring the Playnite extension

Open the plugin's settings page (Add-ons → Playnite Web MQTT) and review the two tabs:

### Connection

Populate the connection tab with the credentials to connect to the MQTT broker.

Key notes:

- Credentials are stored securely with Windows data protection. Saving either the username or password clears any cached token so that a new session can be negotiated.
- Give each Playnite host a unique device identifier so that Playnite Web and Home Assistant can distinguish multiple PCs in your household.

### Library management

If you synchronize multiple launchers or emulators, map each Playnite source to the platform identifier Playnite Web expects. The settings view exposes a table of sources and a drop-down of available platforms, and the selections are persisted when you save the configuration.

After confirming the dialog, the plugin validates the connection and reconnects if needed, so you do not need to restart Playnite to apply changes.

## Connecting Playnite Web to your automation stack

Playnite Web can be configured to emit a webhooks whenever a user requests a release to start, stop, or restart. Enable remote control by supplying a webhook URL in the Playnite Web user settings (Account → Settings). The description in the defaults clarifies that any fully qualified URL is acceptable and that events will be posted there.

Each mutation builds a JSON payload that contains the release identifier, title, cover art URL, library metadata, source, and platform. When a webhook URL is configured, Playnite Web sends the payload via HTTP POST to that endpoint. Forward this body to your MQTT broker to trigger the plugin.

A minimal forwarding script can parse the incoming request and publish the payload directly to MQTT. Most users wire this up inside an automation platform (for example, an HTTP-in → MQTT-out flow in Node-RED).

## MQTT release control topics

Once the webhook payload reaches the broker, publish it to one of the following topics to execute the matching action inside Playnite:

| Topic                                                  | Sample payload                                                  | Description                                                                                                                                              |
| :----------------------------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `playnite/game-room-gaming-pc/request/release/start`   | `{ "releaseId": "PlayniteGuid", "platformId": "PlayniteGuid" }` | Starts the release. If it is not installed, the plugin will kick off installation first; starting happens separately once the install completes.         |
| `playnite/game-room-gaming-pc/request/release/stop`    | `{ "releaseId": "PlayniteGuid", "platformId": "PlayniteGuid" }` | Attempts to gracefully stop the running game. If the process cannot be found, the plugin falls back to stopping the parent launcher (Steam, Epic, etc.). |
| `playnite/game-room-gaming-pc/request/release/restart` | `{ "releaseId": "PlayniteGuid", "platformId": "PlayniteGuid" }` | Issues a stop request and automatically queues a fresh start after a short delay.                                                                        |

Customize the prefix (`game-room-gaming-pc` in the examples above) to match the Playnite host that should handle the command. Use the identifiers reported by your automation tooling so that multi-PC homes can scope commands correctly.

## Example automation flow

The following flow illustrates how you can launch games on a LAN gaming PC from a lightweight dashboard:

1. Configure Playnite Web to send webhooks to a Node-RED endpoint on your home server.
2. Parse the `StartReleaseRequested` payload in Node-RED and publish it to `playnite/game-room-gaming-pc/request/release/start` with the same JSON body.
3. Install the MQTT plugin on the gaming PC running Playnite and point it to your broker.
4. When you click **Play** in the Playnite Web UI, the gaming PC receives the MQTT message and launches the game locally. Subsequent **Stop** or **Restart** actions reuse the same wiring with their respective topics.

Because the Playnite Web plugin also updates metadata back to Playnite Web, the web interface quickly reflects the new running state after each action.

## Troubleshooting tips

- **The Play button does nothing** – Confirm that the webhook URL is set and reachable from Playnite Web, and that your relay forwards the body to the MQTT topic.
- **Messages arrive but no action happens** – Verify that the Playnite plugin is connected (check the add-on log) and that the topic prefix matches the host name you configured.
- **Games stay installed after uninstall requests** – Some launchers require elevated privileges to uninstall. Run Playnite as an administrator when testing uninstall flows.
- **Library metadata looks outdated** – Trigger a manual sync from the Playnite main menu to resend library data through GraphQL.
