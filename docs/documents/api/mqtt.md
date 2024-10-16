[**playnite-web-app**](../../README.md) • **Docs**

***

[playnite-web-app](../../README.md) / api/mqtt

# MQTT Messages

Playnite Web interacts with Playnite via MQTT messages. As such, any other application connected to the same MQTT broker can also subscribe and publish these messages.

## Notes

1. There are some differences between Playnite and Playnite Web's data modeling. Please see [Playnite Web's data model](./../../types.entities/README.md) for more details.
2. Message payloads are utf8 strings of JSON.
3. JSON payloads properties are camel cased; e.g. `id`, `platformId`, etc.

## Value Replacement

| Value Name | Description/Purpose                                                                           |
| :--------- | :-------------------------------------------------------------------------------------------- |
| `deviceId` | Setting in Playnite Web's extension's settings. Should uniquely identify a Playnite instance. |

## Published Messages by Playnite Web

### `playnite/{deviceId}/connection`

Published when Playnite Web connects or disconnects from the MQTT

```ts
type Payload = {
  version: string // Version of Playnite Web extension
  state: 'online' | 'offline'
}
```

### `playnite/{deviceId}/{DataEntityType}/{id}`

Published entity for each entity of type, `DataEntityType`. See [data entities](./data-entities.md) for more details.

```ts
type Payload =
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

### `playnite/{deviceId}/response/game/state`

Published when a release's run state has changed. Supports `installing`, `installed`, `launching`, `running`, `stopping`, `uninstalling`, `uninstalled`, `restarting`.

> Note run states of `installing`, `stopping`, `uninstalling` and `restarting` are published exclusively by Playnite Web application and not the extension.

```ts
type Payload = {
  state: RunState
  release: Release
}
```

### `playnite/{deviceId}/game/start`

Published by the web app when starting a game via the graph API.

```ts
type Payload = {
  game: {
    id: string // Release.id
    gameId: string // Release.gameId; the game ID is the unique identifier assigned by the source in Playnite.
    name: string // Release.name
    platform: {
      id: string // Platform.id
      name: string // Platform.name
    }
  }
}
```

## Subscribed Messages by Playnite Web

| Topic                                | Description/Purpose                                                                  |
| :----------------------------------- | :----------------------------------------------------------------------------------- |
| `playnite/{deviceId}/library`        | Triggers a Playnite Web sync.                                                        |
| `playnite/{deviceId}/game/start`     | Triggers Playnite to start the release.                                              |
| `playnite/{deviceId}/game/install`   | Triggers Playnite to install a release; only valid if release is on the PC platform. |
| `playnite/{deviceId}/game/uninstall` | Triggers Playnite to uninstall a release; only if installed.                         |

### `playnite/{deviceId}/library`

Triggers a Playnite Web sync. There is no payload.

### `playnite/{deviceId}/game/start`

Triggers Playnite to start the release.

```ts
type Payload = {
  game: {
    id: string // Release.id
    platform: {
      id: string // Platform.id
    }
  }
}
```

### `playnite/{deviceId}/game/install`

Triggers Playnite to install a release; only valid if release is on the PC platform.

```ts
type Payload = {
  game: {
    id: string // Release.id
    platform: {
      id: string // Platform.id
    }
  }
}
```

```ts
type Payload = {}
```

### `playnite/{deviceId}/game/uninstall`

Triggers Playnite to uninstall a release; only if installed.

```ts
type Payload = {
  game: {
    id: string // Release.id
    platform: {
      id: string // Platform.id
    }
  }
}
```

```ts
type Payload = {}
```
