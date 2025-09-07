import { create, createNull, tryParseOid } from '../../../../../oid'
import { resolve as resolveAssets } from '../../../../../resolveAssets'
import { defaultSettings as defaultUserSettings } from '../../../../../userSettings'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const startRelease: NonNullable<
  MutationResolvers['startRelease']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  const releaseId = tryParseOid(_arg.id)
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

  if (webhookSetting.value) {
    await fetch(webhookSetting.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'StartReleaseRequested',
        payload: {
          id: create('Release', release.id),
          title: release.title,
          playniteId: release.playniteId,
          coverUrl: release.Cover.slug
            ? resolveAssets(release.Cover.slug)
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
}
