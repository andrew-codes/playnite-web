import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

export const updateGameRelease: NonNullable<
  MutationResolvers['updateGameRelease']
> = async (_parent, _arg, _ctx) => {
  try {
    _ctx.identityService.authorize(_ctx.jwt)

    _ctx.update('Game', _arg.releaseId, _arg.input)
  } catch (e) {
    console.error(e)
    return false
  }

  return true
}
