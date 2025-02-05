[**playnite-web-app**](../../README.md) • **Docs**

***

[playnite-web-app](../../README.md) / [types.entities](../README.md) / Release

# Type Alias: Release

> **Release**: [`Identifiable`](Identifiable.md) & `object`

Release data entity.

## Type declaration

### \_type

> **\_type**: `"Release"`

### added

> **added**: `string` \| `null`

### ageRating

> **ageRating**: `string` \| `null`

### backgroundImage

> **backgroundImage**: `string` \| `null`

### communityScore

> **communityScore**: `number` \| `null`

### completionStatusId

> **completionStatusId**: `string`

### coverImage

> **coverImage**: `string` \| `null`

### criticScore

> **criticScore**: `number` \| `null`

### description

> **description**: `string` \| `null`

### developerIds

> **developerIds**: `string`[]

### featureIds

> **featureIds**: `string`[]

### gameId

> **gameId**: `string`

Id of the release as provided by the release's source.

#### Remarks

This is used to uniquely identify a release within the context of a single source. This may be helpful for automating the running of games on non-PC platforms.

### genreIds

> **genreIds**: `string`[]

### hidden

> **hidden**: `boolean`

### isCustomGame

> **isCustomGame**: `boolean`

### isInstalled

> **isInstalled**: `boolean`

### links

> **links**: `object`[]

### name

> **name**: `string`

### platformId

> **platformId**: `string`

### processId

> **processId**: `string` \| `null`

### publisherIds

> **publisherIds**: `string`[]

### recentActivity

> **recentActivity**: `string`

### releaseDate?

> `optional` **releaseDate**: `object`

### releaseDate.day

> **day**: `number`

### releaseDate.month

> **month**: `number`

### releaseDate.year

> **year**: `number`

### releaseYear?

> `optional` **releaseYear**: `number`

### runState

> **runState**: [`RunState`](RunState.md)

### seriesIds

> **seriesIds**: `string`[]

### sortName

> **sortName**: `string`

### sourceId

> **sourceId**: `string`

### tagIds

> **tagIds**: `string`[]

## Remarks

A release is a specific version of a game that is available on a platform and source. Each platform and source combination will have a single release.

## Defined in

[types.entities.ts:282](https://github.com/andrew-codes/playnite-web/blob/main/apps/playnite-web/src/server/data/types.entities.ts#L282)
