import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateGameRelease: NonNullable<
  MutationResolvers['updateGameRelease']
> = async (_parent, _arg, _ctx) => {
  try {
    _ctx.identityService.authorize(_ctx.jwt)

    _ctx.update({
      entityType: 'Game',
      entityId: _arg.releaseId,
      fields: _arg.input,
    })
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}
