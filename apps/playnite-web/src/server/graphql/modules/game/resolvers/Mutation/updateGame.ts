// import createDebugger from 'debug'
// import { first } from 'lodash'
// import { Game } from '../../../../../data/types.entities'
// import { fromString } from '../../../../../oid'
// import type { MutationResolvers } from './../../../../../../../.generated/types.generated'

// const debug = createDebugger('playnite-web/graphql/game/mutation/updateGame')

// export const updateGame: NonNullable<MutationResolvers['updateGame']> = async (
//   _parent,
//   _arg,
//   _ctx,
// ) => {
//   try {
//     _ctx.identityService.authorize(_ctx.jwt?.payload)

//     const oid = fromString(_arg.id)
//     if (oid.type !== 'Game') {
//       debug(`Invalid entity Oid. Expected Game, got ${oid.type}`)
//       return { success: false }
//     }

//     const game = first(
//       await _ctx.queryApi.execute<Game>({
//         type: 'ExactMatch',
//         entityType: 'Game',
//         field: 'id',
//         value: oid.id,
//       }),
//     )

//     for (const releaseId of game?.releaseIds ?? []) {
//       await _ctx.update({
//         entityType: 'Release',
//         entityId: releaseId,
//         fields: _arg.input,
//       })
//     }

//     return { success: true }
//   } catch (e) {
//     console.error(e)
//     return { success: false }
//   }
// }
