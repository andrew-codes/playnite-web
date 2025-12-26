import type { MutationResolvers } from './../../../../../../../.generated/types.generated'
export const updateSiteSetting: NonNullable<
  MutationResolvers['updateSiteSetting']
> = async (_parent, _arg, _ctx) => {
  return _ctx.db.siteSettings.update({
    where: { id: _arg.id },
    data: {
      value: JSON.stringify(_arg.value),
    },
  })
}
