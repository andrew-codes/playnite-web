[**playnite-web-app**](../../README.md)

***

[playnite-web-app](../../README.md) / api/data-model

# Playnite Web Data Model

## Differences from Playnite

### Playnite.Game vs Game vs Release

All game items in Playnite are considered `Playnite.Game` entities. However, people tend to consider a group of `Playnite.Game`s as a game, where the game is released on one or more platforms. As an example, `Silent Evil 9` is a game that was released on multiple platforms; PlayStation, Steam, Epic, and Xbox. Modeling this in Playnite, there are 4 unique games (`Playnite.Game`). In Playnite Web, this is a single `Game` that has 4 releases `Release`. Each release is on a Platform (`Platform`) of PlayStation, PC, and Xbox.

`Game` is a concept that is not present in Playnite at all, but is present in Playnite Web. `Game`s are computed by grouping `Playnite.Game`s by their name. Note that a game may be released on platforms on different dates; sometimes years apart. Consider exclusives that eventually come to other platforms. For this reason, we cannot group `Playnite.Game`s by name and release date to determine what `Game` a `Release` belongs.

## Entities

See [entities](../../types.entities/README.md) for more details on each entity in Playnite.
