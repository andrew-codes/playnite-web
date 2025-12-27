import { useQuery } from '@apollo/client/react'
import { merge } from 'lodash-es'
import { useEffect } from 'react'
import { Library } from '../../../../.generated/types.generated'
import { useSubscribeEntityUpdates } from '../../shared/hooks/subscribeEntityUpdates'
import { LibraryGamesOnDeckQuery, LibrarySettingsQuery } from '../queries'
import { useSubscribeLibrarySync } from './subscribeLibrarySync'

const useOnDeckGames = (libraryId: string, opts?: any) => {
  const q = useQuery<{ library: Library }>(
    LibraryGamesOnDeckQuery,
    merge({}, opts, {
      variables: { libraryId: libraryId },
    }),
  )

  const librarySettings = useQuery<{ library: Library }>(
    LibrarySettingsQuery,
    merge({}, opts, {
      variables: { libraryId: libraryId },
    }),
  )
  const entityUpdatedSubscription = useSubscribeEntityUpdates()
  useEffect(() => {
    if (
      entityUpdatedSubscription.data?.entityUpdated.some(
        (e) =>
          e.type === 'Release' &&
          e.id === q.data?.library?.id &&
          e.fields.some(
            (field) =>
              field.key === 'completionStatusId' &&
              librarySettings.data?.library?.settings
                ?.find((setting) => setting?.name === 'onDeck')
                ?.value?.includes(field.value || ''),
          ),
      )
    ) {
      q.refetch()
    }
  }, [q, entityUpdatedSubscription?.data?.entityUpdated])

  const librarySubscription = useSubscribeLibrarySync()
  useEffect(() => {
    if (
      librarySubscription.data?.librarySynced.some(
        (e) => e.id === q.data?.library?.id,
      )
    ) {
      q.refetch()
    }
  }, [q, librarySubscription?.data?.librarySynced])

  return q
}

export { useOnDeckGames }
