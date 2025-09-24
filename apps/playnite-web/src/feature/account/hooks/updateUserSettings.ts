import { useMutation } from '@apollo/client/react'
import { keyBy, merge, mergeWith } from 'lodash'
import { UserSetting } from '../../../../.generated/types.generated'
import { MeQuery, UpdateUserSettingsMutation } from '../queries'

const useUpdateUserSettings = () => {
  const mutation = useMutation<{
    userSettings: Array<UserSetting>
  }>(UpdateUserSettingsMutation, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: MeQuery }, (data) =>
        mergeWith(
          {},
          data,
          {
            me: {
              settings: mutationResult.data?.userSettings,
            },
          },
          (objValue, srcValue) => {
            if (Array.isArray(objValue)) {
              const objById = keyBy(objValue, 'id')
              const srcById = keyBy(srcValue, 'id')
              const mergedById = merge(objById, srcById)

              return Object.values(mergedById)
            }
            if (typeof objValue === 'object' && typeof srcValue === 'object') {
              return merge(objValue, srcValue)
            }
          },
        ),
      )
    },
  })

  return mutation
}

export { useUpdateUserSettings }

