import type { QueryResolvers } from './../../../../../../../.generated/types.generated'
export const siteSettings: NonNullable<QueryResolvers['siteSettings']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  return _ctx.db.siteSettings.findMany()
}
