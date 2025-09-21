import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { SiteSetting } from 'apps/playnite-web/.generated/types.generated'

const UpdateSiteSetting = gql`
  mutation UpdateSiteSetting($id: String!, $value: String!) {
    updateSiteSetting(id: $id, value: $value) {
      id
      value
    }
  }
`

const updateSiteSetting = () => {
  return useMutation<{
    siteSettings: Array<SiteSetting>
  }>(UpdateSiteSetting)
}

export { updateSiteSetting, UpdateSiteSetting }
