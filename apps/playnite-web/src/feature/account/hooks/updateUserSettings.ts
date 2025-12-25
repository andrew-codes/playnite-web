import { useMutation } from '@apollo/client/react'
import { User, UserSetting } from '../../../../.generated/types.generated'
import { MeQuery, UpdateUserSettingsMutation } from '../queries'

const useUpdateUserSettings = () => {
  const mutation = useMutation<{
    updateUserSettings: Array<UserSetting>
  }>(UpdateUserSettingsMutation, {
    update: (cache, mutationResult) => {
      const settings = mutationResult.data?.updateUserSettings
      if (!settings) {
        return
      }
      cache.updateQuery<{ me: User }>({ query: MeQuery }, (data) => {
        if (!data?.me) {
          return data
        }

        return {
          me: {
            ...data.me,
            settings,
          },
        }
      })
    },
  })

  return mutation
}

export { useUpdateUserSettings }
