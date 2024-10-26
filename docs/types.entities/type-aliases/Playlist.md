[**playnite-web-app**](../../README.md) • **Docs**

***

[playnite-web-app](../../README.md) / [types.entities](../README.md) / Playlist

# Type Alias: Playlist

> **Playlist**: [`Identifiable`](Identifiable.md) & `object`

Playlist data entity.

## Type declaration

### \_type

> **\_type**: `"Playlist"`

### gameIds

> **gameIds**: `string`[]

### name

> **name**: `string`

Name of the playlist.

#### Remarks

This is the value of the playlist's name; removing the `playlist-` prefix.

## Remarks

Playlists are used to group games together for easy access. A playlist consists of all games that have any of their releases tagged with value that follows the format `playlist-{playlist name}`.

## Defined in

[types.entities.ts:299](https://github.com/andrew-codes/playnite-web/blob/b3004c8cfdb1942d3d0b12745b9fad8b8c4fd686/apps/playnite-web/src/server/data/types.entities.ts#L299)
