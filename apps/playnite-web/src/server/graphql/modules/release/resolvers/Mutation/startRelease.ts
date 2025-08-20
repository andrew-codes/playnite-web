import { GraphQLError } from 'graphql'
import { fromString, hasIdentity } from '../../../../../oid'
import { defaultSettings as defaultUserSettings } from '../../../../../userSettings'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const startRelease: NonNullable<
  MutationResolvers['startRelease']
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

  const webhookSetting = _ctx.db.userSetting.findUniqueOrThrow({
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
      body: JSON.stringify({
        type: 'ReleaseStarted',
        payload: {
          id: release.id,
          title: release.title,
          playniteId: release.PlayniteId,
          coverUrl: `https://${domain}:${port}/public/game-assets/${release.Cover.ignId}.webp`,
          library: release.Library,
          platform: release.Source.Platform,
          source: release.Source,
        },
      }),
    })
  }

  return release
}
