import type { MutationResolvers } from './../../../../../../../.generated/types.generated'
import { defaultSettings } from '../../../../../librarySetting'
import { tryParseOid } from '../../../../../oid'

export const updateLastRoute: NonNullable<
  MutationResolvers['updateLastRoute']
> = async (_parent, _arg, _ctx) => {
  const user = await _ctx.identityService.authorize(_ctx.jwt?.payload)

  if (!user) {
    throw new Error('Unauthorized')
  }

  const libraryId = tryParseOid(_arg.libraryId)

  const library = await _ctx.db.library.findFirst({
    where: { id: libraryId.id, userId: user.id.id },
  })

  if (!library) {
    throw new Error('Forbidden')
  }

  await _ctx.db.librarySetting.upsert({
    where: {
      libraryId_name: {
        name: defaultSettings.lastRoute.id,
        libraryId: library.id,
      },
    },
    create: {
      name: defaultSettings.lastRoute.id,
      value: _arg.route,
      dataType: defaultSettings.lastRoute.dataType,
      libraryId: library.id,
    },
    update: {
      value: _arg.route,
    },
  })

  return library
}
