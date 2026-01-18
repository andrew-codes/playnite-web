import logger from '../../../../../logger'
import { create, createNull, domains } from '../../../../../oid'
import { defaultSettings as defaultUserSettings } from '../../../../../userSettings'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updatePlayniteRunState: NonNullable<
  MutationResolvers['updatePlayniteRunState']
> = async (_parent, _arg, _ctx) => {
  logger.info(
    `Updating release run state with Playnite ID ${_arg.playniteId}...`,
  )
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)
  const userId = user.id

  try {
    const release = await _ctx.db.release.findFirstOrThrow({
      where: {
        playniteId: _arg.playniteId,
        Library: {
          User: {
            id: userId.id,
          },
        },
      },
      include: {
        Game: true,
        Library: true,
        Source: {
          include: {
            Platform: true,
          },
        },
      },
    })

    const updatedRelease = await _ctx.db.release.update({
      where: {
        id: release.id,
      },
      data: {
        runState: _arg.runState,
      },
    })

    _ctx.subscriptionPublisher.publish('entityUpdated', {
      id: release.id,
      source: 'PlayniteWeb',
      type: domains.Release,
      fields: [
        {
          key: 'runState',
          value: _arg.runState,
        },
      ],
      playniteId: _arg.playniteId,
    })

    const webhookSetting = await _ctx.db.userSetting.findUnique({
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
    if (webhookSetting?.value) {
      await fetch(JSON.parse(webhookSetting.value as string), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type:
            _arg.runState === 'running'
              ? 'StartReleaseRequested'
              : 'StoppedRelease',
          payload: {
            id: create('Release', release.id),
            title: release.title,
            coverUrl: release.Game.coverArt
              ? `/cover-art/${release.Game.coverArt}`
              : null,
            playniteId: release.playniteId,
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

    logger.info(
      `Successfully updated release with Playnite ID ${_arg.playniteId}.`,
    )
    return updatedRelease
  } catch (error) {
    logger.error(
      `Failed to update release with Playnite ID ${_arg.playniteId}:`,
      error,
    )
    throw error
  }
}
