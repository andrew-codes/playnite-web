import { defaultSettings as defaultUserSettings } from '../../../../../userSettings.js'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateUserSettings: NonNullable<
  MutationResolvers['updateUserSettings']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  return Promise.all(
    _arg.input.settings.map((setting) => {
      return _ctx.db.userSetting.update({
        where: {
          userId_name: {
            userId: user.id.id,
            name: defaultUserSettings[setting.id].name,
          },
        },
        data: {
          value: setting.value,
        },
      })
    }),
  )
}
