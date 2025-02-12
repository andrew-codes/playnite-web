[**playnite-web-app**](../../README.md)

***

[playnite-web-app](../../README.md) / [types.entities](../README.md) / Platform

# Type Alias: Platform

> **Platform**: [`Identifiable`](Identifiable.md) & `object`

Defined in: [types.entities.ts:143](https://github.com/andrew-codes/playnite-web/blob/main/apps/playnite-web/src/server/data/types.entities.ts#L143)

Platform data entity.

## Type declaration

### \_type

> **\_type**: `"Platform"`

### background

> **background**: `string` \| `null`

Background image ID.

#### Remarks

Images are served from `domain/asset-by-id/{id}`.

### cover

> **cover**: `string` \| `null`

Cover image ID.

#### Remarks

Images are served from  `domain/asset-by-id/{id}`.

### icon

> **icon**: `string` \| `null`

### name

> **name**: `string`

Platform name.

### specificationId

> **specificationId**: `string`

#### Remarks

Provided by Playnite, but not currently used.

## Remarks

Platforms are used to categorize games by the system they are played on. Note a game may have multiple releases for a single platform. An example of this would be a game released on the PC platform for Steam and Epic sources.
