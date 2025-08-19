import type { MutationResolvers } from './../../../../../../../.generated/types.generated'
export const updateUserSettings: NonNullable<
  MutationResolvers['updateUserSettings']
> = async (_parent, _arg, _ctx) => {
  return Promise.all(
    _arg.input.settings.map((setting) => {
      return _ctx.db.userSetting.update({
        where: {
          id: setting.id,
        },
        data: {
          value: setting.value,
        },
      })
    }),
  )
}
