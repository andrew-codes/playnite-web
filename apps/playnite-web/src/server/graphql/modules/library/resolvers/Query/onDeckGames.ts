import { defaultSettings } from 'apps/playnite-web/src/server/librarySetting'
import { tryParseOid } from '../../../../../oid'
import type { QueryResolvers } from './../../../../../../../.generated/types.generated'

export const onDeckGames: NonNullable<QueryResolvers['onDeckGames']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const libraryId = tryParseOid(_arg.libraryId)

  const onDeckSetting = await _ctx.db.librarySetting.findUnique({
    where: {
      libraryId_name: {
        name: defaultSettings.onDeck.id,
        libraryId: libraryId.id,
      },
    },
  })

  const onDeckCompletionStates = Array.isArray(onDeckSetting?.value)
    ? (onDeckSetting.value as Array<string>).map(
        (state) => tryParseOid(state).id,
      )
    : []

  return _ctx.db.game.findMany({
    where: {
      libraryId: libraryId.id,
      Releases: {
        some: {
          completionStatusId: {
            in: onDeckCompletionStates,
          },
        },
      },
    },
    orderBy: {
      title: 'asc',
    },
  })
}
