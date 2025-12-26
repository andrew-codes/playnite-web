import type { LibraryResolvers } from '../../../../../../.generated/types.generated'
import { defaultSettings } from '../../../../librarySetting'
import { create, tryParseOid } from '../../../../oid'

export const Library: LibraryResolvers = {
  id: (library) => create('Library', library.id).toString(),
  games: async (library, _args, ctx) => {
    return ctx.db.game.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        title: 'asc',
      },
    })
  },
  platforms: async (library, _args, ctx) => {
    return ctx.db.platform.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
  playlists: async (library, _args, ctx) => {
    return ctx.db.playlist.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
  sources: async (library, _args, ctx) => {
    return ctx.db.source.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
  features: async (library, _args, ctx) => {
    return ctx.db.feature.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
  completionStates: async (library, _args, ctx) => {
    return ctx.db.completionStatus.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
  tags: async (library, _args, ctx) => {
    return ctx.db.tag.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
  gamesOnDeck: async (library, _args, ctx) => {
    const onDeckSetting = await ctx.db.librarySetting.findUnique({
      where: {
        libraryId_name: {
          name: defaultSettings.onDeck.id,
          libraryId: library.id,
        },
      },
    })

    const onDeckCompletionStates = Array.isArray(onDeckSetting?.value)
      ? (onDeckSetting.value as Array<string>).map(
          (state) => tryParseOid(state).id,
        )
      : []

    return ctx.db.game.findMany({
      where: {
        libraryId: library.id,
        Releases: {
          some: {
            completionStatusId: {
              in: onDeckCompletionStates,
            },
          },
        },
      },
      orderBy: {
        title: 'asc',
      },
    })
  },
  settings: async (library, _args, ctx) => {
    const user = await ctx.identityService.authorize(ctx.jwt?.payload)

    if (!user) {
      throw new Error('Unauthorized')
    }

    if (library.userId !== user.id.id) {
      throw new Error('Forbidden')
    }

    return ctx.db.librarySetting.findMany({
      where: {
        libraryId: library.id,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },
}
