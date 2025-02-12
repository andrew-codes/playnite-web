[**playnite-web-app**](../../README.md)

***

[playnite-web-app](../../README.md) / [types.entities](../README.md) / Game

# Type Alias: Game

> **Game**: [`Identifiable`](Identifiable.md) & `object`

Defined in: [types.entities.ts:247](https://github.com/andrew-codes/playnite-web/blob/main/apps/playnite-web/src/server/data/types.entities.ts#L247)

Game data entity.

## Type declaration

### \_type

> **\_type**: `"Game"`

### cover

> **cover**: `string` \| `null`

### description

> **description**: `string` \| `null`

### name

> **name**: `string`

### releaseIds

> **releaseIds**: `string`[]

## Remarks

A game is a grouping of releases that share the same name.
The game's ID is computed from the name of its releases.

A game may have multiple releases across different platforms and sources.
