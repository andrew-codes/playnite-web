import { QueryResolvers } from '../../../../../../../.generated/types.generated.js'
import { defaultSettings } from '../../../../../siteSettings.js'

export const accountSetupStatus: NonNullable<
  QueryResolvers['accountSetupStatus']
> = async (_parent, _args, { db }) => {
  const userCount = await db.user.count()
  const isSetup = userCount > 0

  let allowAnonymousAccountCreation = false
  if (isSetup) {
    const setting = await db.siteSettings.findUnique({
      where: { id: defaultSettings.allowAnonymousAccountCreation.id },
    })
    allowAnonymousAccountCreation = setting?.value === 'true'
  }

  return {
    isSetup,
    allowAnonymousAccountCreation,
  }
}

export default accountSetupStatus
