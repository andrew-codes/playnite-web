import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { SiteSetting } from '../../../../.generated/types.generated'

const UpdateSiteSettingQuery = gql`
  mutation UpdateSiteSetting($id: String!, $value: String!) {
    updateSiteSetting(id: $id, value: $value) {
      id
      value
    }
  }
`

const useUpdateSiteSetting = () => {
  return useMutation<{
    updateSiteSetting: SiteSetting
  }>(UpdateSiteSettingQuery)
}

export { UpdateSiteSettingQuery, useUpdateSiteSetting }
