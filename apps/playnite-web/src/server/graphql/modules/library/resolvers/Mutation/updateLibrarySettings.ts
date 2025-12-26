import { IIdentify, tryParseOid } from '../../../../../oid'
import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateLibrarySettings: NonNullable<
  MutationResolvers['updateLibrarySettings']
> = async (_parent, _arg, _ctx) => {
  await _ctx.identityService.authorize(_ctx.jwt?.payload)

  return Promise.all(
    _arg.input.settings
      .map((setting) => {
        return {
          id: tryParseOid(setting.id),
          value: setting.value,
        }
      })
      .map((setting) => {
        return _ctx.db.librarySetting.update({
          where: {
            id: (setting.id as IIdentify).id,
          },
          data: {
            value: JSON.stringify(setting.value),
          },
        })
      }),
  )
}
