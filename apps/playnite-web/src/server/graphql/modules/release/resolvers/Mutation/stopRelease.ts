import { GraphQLError } from 'graphql'
import logger from '../../../../../logger'
import { create, createNull, tryParseOid } from '../../../../../oid'
import { defaultSettings as defaultUserSettings } from '../../../../../userSettings'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const stopRelease: NonNullable<
  MutationResolvers['stopRelease']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  try {
    const releaseId = tryParseOid(_arg.id)

    await _ctx.db.release.findUniqueOrThrow({
      where: {
        id: releaseId.id,
        Library: {
          User: {
            id: user.id.id,
          },
        },
      },
    })

    const release = await _ctx.db.release.findUniqueOrThrow({
      where: {
        id: releaseId.id,
      },
      include: {
        Library: true,
        Game: true,
        Source: {
          include: {
            Platform: true,
          },
        },
      },
    })

    await _ctx.db.release.update({
      where: {
        id: release.id,
      },
      data: {
        runState: 'stopping',
      },
    })

    const webhookSetting = await _ctx.db.userSetting.findUniqueOrThrow({
      where: {
        userId_name: {
          name: defaultUserSettings.webhook.id,
          userId: user.id.id,
        },
      },
      select: {
        value: true,
      },
    })

    if (webhookSetting.value) {
      await fetch(JSON.parse(webhookSetting.value as string), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'StopReleaseRequested',
          payload: {
            id: create('Release', release.id),
            title: release.title,
            playniteId: release.playniteId,
            coverUrl: release.Game.coverArt
              ? `/cover-art/${release.Game.coverArt}`
              : null,
            library: {
              id: create('Library', release.Library.id),
              name: release.Library.name,
              playniteId: release.Library.playniteId,
            },
            platform: {
              id: release.Source?.Platform?.id
                ? create('Platform', release.Source.Platform.id)
                : createNull('Platform'),
              name: release.Source?.Platform?.name ?? '',
              playniteId: release.Source?.Platform?.playniteId,
            },
            source: {
              id: create('Source', release.Source.id),
              name: release.Source.name,
              playniteId: release.Source.playniteId,
            },
          },
        }),
      })
    }

    return release
  } catch (error) {
    logger.error(`Failed to stop release ${_arg.id}`, error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    throw new GraphQLError(
      'Unauthorized: Release not found in your libraries',
      {
        extensions: {
          code: 'UNAUTHORIZED',
          http: {
            status: 403,
          },
          headers: {
            'X-Error-Message': errorMessage,
          },
        },
      },
    )
  }
}
