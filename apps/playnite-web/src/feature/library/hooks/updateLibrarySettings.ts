import { useMutation } from '@apollo/client/react'
import { Library, LibrarySetting } from '../../../../.generated/types.generated'
import { LibrarySettingsQuery, UpdateLibrarySettingsMutation } from '../queries'

const useUpdateLibrarySettings = () => {
  const mutation = useMutation<{
    updateLibrarySettings: Array<LibrarySetting>
  }>(UpdateLibrarySettingsMutation, {
    update: (cache, mutationResult) => {
      const settings = mutationResult.data?.updateLibrarySettings
      if (!settings) {
        return
      }

      cache.updateQuery<{ library: Library }>(
        { query: LibrarySettingsQuery },
        (data) => {
          if (!data?.library) {
            return data
          }

          return {
            library: {
              ...data.library,
              settings,
            },
          }
        },
      )
    },
  })

  return mutation
}

export { useUpdateLibrarySettings }
