import { useMutation } from '@apollo/client/react'
import { keyBy, merge } from 'lodash-es'
import { UserSetting } from '../../../../.generated/types.generated'
import { UpdateUserSettingsMutation } from '../queries'

const useUpdateUserSettings = () => {
  const mutation = useMutation<{
    userSettings: Array<UserSetting>
  }>(UpdateUserSettingsMutation, {
    update: (cache, mutationResult) => {
      const setting = mutationResult.data?.userSettings
      if (!setting) {
        return
      }
      cache.modify({
        id: cache.identify({ __typename: 'User', id: 'me' }),
        fields: {
          settings(existingSettings = []) {
            const existingById = keyBy(existingSettings, 'id')
            const newById = keyBy(setting, 'id')
            const mergedById = merge(existingById, newById)

            return Object.values(mergedById)
          },
        },
      })
    },
  })

  return mutation
}

export { useUpdateUserSettings }
