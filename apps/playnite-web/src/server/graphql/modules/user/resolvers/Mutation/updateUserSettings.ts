import { fromString, hasIdentity, IIdentify } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateUserSettings: NonNullable<
  MutationResolvers['updateUserSettings']
> = async (_parent, _arg, _ctx) => {
  await _ctx.identityService.authorize(_ctx.jwt?.payload)

  return Promise.all(
    _arg.input.settings
      .map((setting) => {
        return {
          id: fromString(setting.id),
          value: setting.value,
        }
      })
      .filter((setting) => hasIdentity(setting.id))
      .map((setting) => {
        return _ctx.db.userSetting.update({
          where: {
            id: (setting.id as IIdentify).id,
          },
          data: {
            value: setting.value,
          },
        })
      }),
  )
}
