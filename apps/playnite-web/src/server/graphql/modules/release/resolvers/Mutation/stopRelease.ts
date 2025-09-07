import { GraphQLError } from 'graphql'
import { create, createNull, fromString, hasIdentity } from '../../../../../oid'
import { defaultSettings as defaultUserSettings } from '../../../../../userSettings'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const stopRelease: NonNullable<
  MutationResolvers['stopRelease']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  const releaseId = fromString(_arg.id)
  if (!hasIdentity(releaseId)) {
    throw new GraphQLError('Invalid OID format.', {
      extensions: {
        code: 'BAD_USER_INPUT',
        argument: _arg.id,
      },
    })
  }

  const release = await _ctx.db.release.findUniqueOrThrow({
    where: {
      id: releaseId.id,
    },
    include: {
      Library: true,
      Cover: true,
      Source: {
        include: {
          Platform: true,
        },
      },
    },
  })

  const webhookSetting = await _ctx.db.userSetting.findUniqueOrThrow({
    where: {
      userId_name: {
        name: defaultUserSettings.webhook.name,
        userId: user.id.id,
      },
    },
    select: {
      value: true,
    },
  })

  if (!!webhookSetting.value) {
    const { PORT, HOST } = process.env
    const port = PORT ? parseInt(PORT, 10) : 3000
    const domain = HOST ?? 'localhost'

    await fetch(webhookSetting.value, {
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
          coverUrl: `https://${domain}:${port}/public/game-assets/${release.Cover.ignId}.webp`,
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
}
