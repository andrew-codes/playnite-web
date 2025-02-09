[**playnite-web-app**](../../README.md) • **Docs**

***

[playnite-web-app](../../README.md) / api/mqtt

# MQTT Messages

Playnite Web interacts with Playnite via MQTT messages. As such, any other application connected to the same MQTT broker can also subscribe and publish these messages.

## Notes

1. There are some differences between Playnite and Playnite Web's data modeling. Please see [Playnite Web's data model](./../../types.entities/README.md) for more details.
2. Message payloads are utf8 strings of JSON.
3. Message payloads' JSON properties are camel cased; e.g. `id`, `platformId`, etc.

## Value Replacement

| Value Name       | Description/Purpose                                                                           |
| :--------------- | :-------------------------------------------------------------------------------------------- |
| `deviceId`       | Setting in Playnite Web's extension's settings. Should uniquely identify a Playnite instance. |
| `DataEntityType` | A valid data entity type string. See [data entities](./data-entities.md) for more details.    |
| `id`             | A Playnite unique identifier.                                                                 |

## Published Messages by Playnite Web

### `playnite/{deviceId}/connection`

Persistent message published when Playnite Web connects or disconnects from the MQTT

```ts
type Payload = {
  version: string // Version of Playnite Web extension
  state: 'online' | 'offline'
}
```

### `playnite/update/{deviceId}/{DataEntityType}/{id}`

Persistent message published entity for each entity of type, `DataEntityType`.

```ts
type Payload =
action: "update" | "delete"
from: "playnite-web" | "{deviceId}"
entity:
  | Game
  | Release
  | Platform
  | Playlist
  | Source
  | Tag
  | Feature
  | CompletionStatus
  | Genre
```

### `playnite/{deviceId}/Release/{id}/state`

Persistent message published when a release's run state has changed. Supports `installing`, `installed`, `launching`, `running`, `stopping`, `uninstalling`, `uninstalled`, `restarting`.

```ts
type Payload = {
  state: RunState
  gameId: string
  processId: number | null
}
```

### `playnite/{deviceId}/request/release/start`

Non-persistent message published by the web app when starting a release via the graph API.

```ts
type Payload = {
  release: {
    id: string
    gameId: string // Release.gameId; the game ID is the unique identifier assigned by the source in Playnite.
    name: string // Release.name
    platform: {
      id: string // Platform.id
      name: string // Platform.name
    }
  }
}
```

### `playnite/{deviceId}/request/release/restart`

Non-persistent message published by the web app when restarting a release via the graph API.

```ts
type Payload = {
  release: {
    id: string
    gameId: string // Release.gameId; the game ID is the unique identifier assigned by the source in Playnite.
    name: string // Release.name
    platform: {
      id: string // Platform.id
      name: string // Platform.name
    }
  }
}
```

### `playnite/{deviceId}/request/release/stop`

Non-persistent message published by the web app when stopping a release via the graph API.

```ts
type Payload = {
  release: {
    id: string
    gameId: string // Release.gameId; the game ID is the unique identifier assigned by the source in Playnite.
    name: string // Release.name
    platform: {
      id: string // Platform.id
      name: string // Platform.name
    }
  }
}
```

## Subscribed Messages by Playnite

| Topic                                           | Description/Purpose                                                                  |
| :---------------------------------------------- | :----------------------------------------------------------------------------------- |
| `playnite/request/library`                      | Triggers a Playnite Web sync.                                                        |
| `playnite/{deviceId}/request/release/start`     | Triggers Playnite to start the release.                                              |
| `playnite/{deviceId}/request/release/install`   | Triggers Playnite to install a release; only valid if release is on the PC platform. |
| `playnite/{deviceId}/request/release/uninstall` | Triggers Playnite to uninstall a release; only if installed.                         |
| `playnite/{deviceId}/request/release/stop`      | Triggers Playnite to stop a release, if running.                                     |

### `playnite/request/library`

Triggers a Playnite Web sync. There is no payload.

### `playnite/{deviceId}/request/release/start`

Triggers Playnite to start the release.

```ts
type Payload = {
  release: {
    id: string // Release.id
    platform: {
      id: string // Platform.id
    }
  }
}
```

### `playnite/{deviceId}/request/release/install`

Triggers Playnite to install a release; only valid if release is on the PC platform.

```ts
type Payload = {
  release: {
    id: string // Release.id
    platform: {
      id: string // Platform.id
    }
  }
}
```

### `playnite/{deviceId}/request/release/uninstall`

Triggers Playnite to uninstall a release; only if installed.

```ts
type Payload = {
  release: {
    id: string // Release.id
    platform: {
      id: string // Platform.id
    }
  }
}
```

### `playnite/{deviceId}/request/release/stop`

Triggers Playnite to stop a game process; if one is running.

```ts
type Payload = {
  release: {
    id: string // Release.id
    processId: int // Process ID provided in MQTT release state message.
    platform: {
      id: string // Platform.id
    }
  }
}
```
