import _ from 'lodash'
import type {
  GameRelease,
  PlaylistResolvers,
} from '../../../../../../.generated/types.generated'
import { create } from '../../../../oid'
import { GameEntity } from '../../../resolverTypes'

const { startCase, lowerCase } = _

export const Playlist: PlaylistResolvers = {
  id: async (_parent, _arg, _ctx) => {
    return create('Playlist', _parent.id).toString()
  },
  name: async (_parent, _arg, _ctx) => {
    return startCase(
      lowerCase(_parent.name.replace('playlist-', '').replaceAll('-', ' ')),
    )
  },
  games: async (_parent, _arg, _ctx) => {
    const onDeckPlaylist = _parent.name.toLowerCase().includes('on deck')
    if (onDeckPlaylist) {
      const games = await _ctx.api.game.getBy({ playlists: _parent.id })
      const gamesByMostRecentActivity = (
        await Promise.all(
          games.map(async (game) => {
            const releasesByGame = await Promise.all(
              game.releases.map(
                async (release) => await _ctx.api.gameRelease.getById(release),
              ),
            )
            const sortedReleases = releasesByGame.sort((releaseA, releaseB) => {
              if (!releaseA.lastActivity && !releaseB.lastActivity) return 0
              else if (!releaseA.lastActivity) return 1
              else if (!releaseB.lastActivity) return -1

              return (
                Date.parse(releaseB.lastActivity) -
                Date.parse(releaseA.lastActivity)
              )
            })
            return { ...game, releasesSortedByActivity: sortedReleases }
          }),
        )
      ).sort(
        (
          gameA: GameEntity & {
            releasesSortedByActivity: Array<GameRelease>
          },
          gameB: GameEntity & {
            releasesSortedByActivity: Array<GameRelease>
          },
        ) => {
          const mostRecentActivityA =
            gameA.releasesSortedByActivity?.[0]?.lastActivity
          const mostRecentActivityB =
            gameB.releasesSortedByActivity?.[0]?.lastActivity

          if (!mostRecentActivityA && !mostRecentActivityB) {
            return gameA.name.localeCompare(gameB.name)
          } else if (!mostRecentActivityA) return 1
          else if (!mostRecentActivityB) return -1
          return (
            Date.parse(mostRecentActivityB) - Date.parse(mostRecentActivityA)
          )
        },
      )
      return gamesByMostRecentActivity
    } else {
      return await _ctx.api.game.getBy({ playlists: _parent.id })
    }
  },
}
