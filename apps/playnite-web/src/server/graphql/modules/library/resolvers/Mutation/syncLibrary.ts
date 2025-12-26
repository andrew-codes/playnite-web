import { defaultSettings } from 'apps/playnite-web/src/server/librarySetting'
import logger from '../../../../../logger'
import { getClient } from '../../../../../mqtt'
import { hasIdentity } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const syncLibrary: NonNullable<
  MutationResolvers['syncLibrary']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  const userId = user.id
  logger.debug('User', user)
  if (!userId || !hasIdentity(userId)) {
    throw new Error('Invalid OID format.')
  }

  logger.silly(`Library data`, _arg.libraryData)
  logger.info(
    `Syncing library ${_arg.libraryData.libraryId} for user ${userId.id}`,
  )

  // Upsert library to get/create libraryId
  const library = await _ctx.db.library.upsert({
    where: {
      playniteId_userId: {
        playniteId: _arg.libraryData.libraryId,
        userId: userId.id,
      },
    },
    create: {
      playniteId: _arg.libraryData.libraryId,
      User: {
        connect: { id: userId.id },
      },
      name: _arg.libraryData.name ?? 'Default Library',
    },
    update: {
      name: _arg.libraryData.name ?? 'Default Library',
    },
  })

  const libraryId = library.id
  logger.info(`Library ID: ${libraryId}`)

  logger.silly(`Creating library settings for library ${libraryId}`)
  const settings = Object.values(defaultSettings)
  await _ctx.db.librarySetting.createMany({
    data: settings.map((setting) => ({
      libraryId: libraryId,
      name: setting.id,
      value:
        setting?.[setting.id] ?? (Array.isArray(setting.value) ? [] : null),
      dataType: setting.dataType,
    })),
    skipDuplicates: true,
  })

  // Publish complete library data to MQTT for processing
  const mqtt = await getClient()

  try {
    await mqtt.publish(
      `playnite-web/library/sync`,
      JSON.stringify({
        libraryId,
        userId: userId.id,
        libraryData: _arg.libraryData,
      }),
      { qos: 2 },
    )
    logger.info(`Published library sync message for library ${libraryId}`)
  } catch (error) {
    logger.error(
      `Error publishing library sync MQTT message for library ${libraryId}`,
      error,
    )
    throw new Error('Failed to publish library sync message')
  }

  logger.info(`Library ${libraryId} sync initiated successfully`)

  return library
}
