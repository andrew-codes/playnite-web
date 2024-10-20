[**playnite-web-app**](../../README.md) • **Docs**

***

[playnite-web-app](../../README.md) / [types.entities](../README.md) / Game

# Type Alias: Game

> **Game**: [`Identifiable`](Identifiable.md) & `object`

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

## Defined in

[types.entities.ts:220](https://github.com/andrew-codes/playnite-web/blob/62650104502962ee3f84085d0697cd28bab46d1c/apps/playnite-web/src/server/data/types.entities.ts#L220)
