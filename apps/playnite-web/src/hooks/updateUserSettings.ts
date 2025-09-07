import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { UserSetting } from 'apps/playnite-web/.generated/types.generated'
import { keyBy, merge, mergeWith } from 'lodash-es'
import { Me } from './me'

const UpdateUserSettings = gql`
  mutation UpdateUserSettings($settings: [UserSettingInput!]!) {
    updateUserSettings(input: { settings: $settings }) {
      id
      value
    }
  }
`

const updateUserSettings = () => {
  const mutation = useMutation<{
    userSettings: Array<UserSetting>
  }>(UpdateUserSettings, {
    update: (cache, mutationResult) => {
      cache.updateQuery({ query: Me }, (data) =>
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

export { updateUserSettings, UpdateUserSettings }
