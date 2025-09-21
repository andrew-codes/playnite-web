import { prisma } from './data/providers/postgres/client.js'
import logger from './logger.js'
import { defaultSettings } from './siteSettings.js'

const setupApp = async (): Promise<void> => {
  logger.info('Setting up Playnite Web app...')

  logger.info('Ensuring site settings are initialized....')
  await Promise.all(
    Object.entries(defaultSettings).map(async ([id, setting]) => {
      const storedSetting = await prisma.siteSettings.upsert({
        where: { id },
        create: {
          id,
          name: setting.name,
          value: setting.value,
          dataType: setting.dataType,
        },
        update: {},
      })
      logger.info(
        ` - ${storedSetting.name}: ${storedSetting.value} (${storedSetting.dataType})`,
      )
    }),
  )
}

export { setupApp }
