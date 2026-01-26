# How to Use Playnite Web as a Remote Control with Home Assistant

- [Overview](#overview)
- [Requirements](#requirements)
- [Step 1 - Set Up a Webhook Automation in Home Assistant](#step-1---set-up-a-webhook-automation-in-home-assistant)
	- [Playnite Web MQTT Control Topics](#playnite-web-mqtt-control-topics)
	- [Example Automation](#example-automation)
- [Step 2 - Add the Webhook URL to Playnite Web](#step-2---add-the-webhook-url-to-playnite-web)
- [Step 3 - Access Playnite Web to Remotely Your Games Library](#access-playnite-web-to-remotely-your-games-library)

## Overview 

You can connect Playnite Web with Home Assistant, an open source home automation tool, so that you can use Playnite Web to remotely control your games with these actions:

- Start
- Stop
- Restart 
- Install 
- Uninstall

To use Playnite Web as a remote control, you need to install the Playnite Web MQTT plugin so that Playnite can receive MQTT messages. You then need to configure an automation webhook in Home Assistant so that Playnite Web can post an MQTT message to perform an action. 

## Requirements

Before you begin, make sure you have installed:

- Playnite Web. See the [setup guide](./docs/user-guides/setup-guide.md).
- Playnite Web MQTT Plugin. See the [MQTT plugin documentation](./docs/mqtt-plugin-documentation/index.md).
- Home Assistant. See their [Github repo](https://github.com/home-assistant).

## Step 1 - Set Up a Webhook Automation in Home Assistant

> **Note:** We recommend setting up one automation for starting, stopping, and restarting games, to avoid multiple automations running concurrently. 

See the [Home Assistant Documentation](https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger) for setting up a webhook automation trigger. 

You must set up the automation to publish MQTT topics that will execute the matching action in Playnite Web. The payload is in JSON format. See the table in the next section for the MQTT topics and sample payloads.

### Playnite Web MQTT Control Topics  

Replace "game-room-gaming-pc" in the topics to match the Playnite host you want to receive the command, based on the identifier reported by Home Assistant. 

|Action| Topic                                                  | Sample payload                                                  |Description |
|:-----| :----------------------------------------------------- | :-------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------- |
|**Start**| `playnite/game-room-gaming-pc/request/release/start`   | `{ "releaseId": "PlayniteGuid", "platformId": "PlayniteGuid" }` | Starts the release. If it is not installed, the plugin will kick off installation first; starting happens separately once the install completes.         |
|**Stop**| `playnite/game-room-gaming-pc/request/release/stop`    | `{ "releaseId": "PlayniteGuid", "platformId": "PlayniteGuid" }` | Attempts to gracefully stop the running game. If the process cannot be found, the plugin falls back to stopping the parent launcher (Steam, Epic, etc.). |
|**Restart**| `playnite/game-room-gaming-pc/request/release/restart` | `{ "releaseId": "PlayniteGuid", "platformId": "PlayniteGuid" }` | Issues a stop request and automatically queues a fresh start after a short delay.|
|**Install**| `"playnite/game-room-gaming-pc/request/release/install"` |  `{"releaseId": "PlayniteGuid", "platformId: "PlayniteGuid"}` | Installs the game if it's not already installed. Otherwise, does nothing. |
|**Uninstall**| `"playnite/game-room-gaming-pc/request/release/uninstall"` | `{"releaseId": "PlayniteGuid", "platformId: "PlayniteGuid"}` | Uninstalls the game. Note that some launchers may require administrator permissions to uninstall games. You may need to run Playnite Web as an administrator. |


### Example Automation 

This is an example of a Home Assistant automation that can start, stop, and restart your games using Playnite Web: 

```
description: ""
mode: restart
triggers:
  - trigger: webhook
    allowed_methods:
      - POST
    local_only: false
    webhook_id: YOUR_UNIQUE_WEBHOOK_ID_HERE
conditions: []
actions:
  - variables:
      platform_id: "{{ trigger.json.payload.platform.id }}"
      platform_name: "{{ trigger.json.payload.platform.name }}"
      platform_playnite_id: "{{ trigger.json.payload.platform.playniteId }}"
      release_playnite_id: "{{ trigger.json.payload.playniteId }}"
      release_id: "{{ trigger.json.payload.id }}"
      library_playnite_id: "{{ trigger.json.payload.library.playniteId }}"
      action_type: "{{ trigger.json.type }}"
  - alias: Choose automation based on type of event
    choose:
      - conditions:
          - alias: Event type is to start a release
            condition: template
            value_template: "{{ action_type == \"StartReleaseRequested\" }}"
        sequence:
          - alias: Start game
            choose:
              - conditions:
                  - condition: template
                    value_template: "{{ platform_name is search(\"PC\") }}"
                    alias: PC
                sequence:
                  - action: mqtt.publish
                    metadata: {}
                    data:
                      qos: "2"
                      topic: playnite/YOUR_MQTT_DEVICE_NAME/request/release/start
                      payload: >-
                        {"releaseId":"{{release_playnite_id}}","platformId":
                        "{{platform_playnite_id}}"}
                    alias: Start PC game
              - conditions:
                  - condition: template
                    value_template: "{{ platform_name is search(\"PlayStation\") }}"
                    alias: PlayStation
                sequence:
                  - action: rest_command.playnite_web
                    metadata: {}
                    data:
                      query: |
                        mutation MyMutation($release: ReleaseInput!) {
                          updateRelease(release: $release) {
                            id
                          }
                        }
                      variables: >-
                        release {{ dict( release = dict( id = release_id,
                        runState = "running" ) ) }}
                    alias: Manually update run state in PW
      - conditions:
          - condition: template
            value_template: "{{ action_type == \"StopReleaseRequested\" }}"
            alias: Event type is stop release
        sequence:
          - alias: Stop game
            action: mqtt.publish
            metadata: {}
            data:
              qos: "2"
              topic: playnite/YOUR_MQTT_DEVICE_NAME/request/release/stop
              payload: >-
                {"releaseId":"{{release_playnite_id}}","platformId":
                "{{platform_playnite_id}}"}
          - action: rest_command.playnite_web
            metadata: {}
            data:
              query: |
                mutation MyMutation($release: ReleaseInput!) {
                  updateRelease(release: $release) {
                    id
                  }
                }
              variables: >-
                release {{ dict( release = dict( id = release_id, runState =
                "stopped" ) ) }}
            alias: Graph update stopped
        alias: Event type is to stop a release
      - conditions:
          - condition: template
            value_template: "{{ action_type == \"RestartReleaseRequested\" }}"
            alias: Event type is restart
        sequence:
          - action: input_boolean.turn_on
            metadata: {}
            target:
              entity_id: input_boolean.is_restarting_game
            data: {}
          - alias: Choose platform
            choose:
              - conditions:
                  - condition: template
                    value_template: "{{ platform_name is search(\"PC\") }}"
                    alias: PC
                sequence:
                  - alias: Restart PC game
                    action: mqtt.publish
                    metadata: {}
                    data:
                      qos: "2"
                      topic: playnite/YOUR_MQTT_DEVICE_NAME/request/release/restart
                      payload: >-
                        {"releaseId":"{{release_playnite_id}}","platformId":
                        "{{platform_playnite_id}}"}
              - conditions:
                  - alias: PlayStation
                    condition: template
                    value_template: "{{ platform_name is search(\"PlayStation\") }}"
                sequence:
                  - action: rest_command.playnite_web
                    metadata: {}
                    data:
                      query: |
                        mutation MyMutation($release: ReleaseInput!) {
                          updateRelease(release: $release) {
                            id
                          }
                        }
                      variables: >-
                        release {{ dict( release = dict( id = release_id,
                        runState = "running" ) ) }}
                    alias: Graph update running
          - delay:
              hours: 0
              minutes: 0
              seconds: 10
              milliseconds: 0
          - action: input_boolean.turn_off
            metadata: {}
            target:
              entity_id: input_boolean.is_restarting_game
            data: {}
        alias: Event type is to restart a release
        ```

## Step 2 - Add the Webhook URL to Playnite Web

Add the webhook URL for your Home Assistant trigger so that Playnite Web can initiate the automation: 

1. Sign in to Playnite Web.
2. Navigate to Account → Settings.
3. Provide the same webhook URL that Home Assistant provided you when you set up the automation trigger. 

## Step 3 - Access Playnite Web to Remotely Control Your Games Library

> **Note:** You must be signed in to Playnite Web in order to to trigger your Home Assistant automation.

1. Sign in to Playnite Web on the device you want to use as a remote control.
2. Use the game details pane to select an action. It must be an action that you configured Home Assistant to publish the corresponding MQTT topic for. 
