import { gql } from '@apollo/client/core'

const SiteSettingsQuery = gql`
  query GetSiteSettings {
    siteSettings {
      id
      name
      value
      description
      dataType
    }
  }
`

const UpdateSiteSettingMutation = gql`
  mutation UpdateSiteSetting($id: String!, $value: String!) {
    updateSiteSetting(id: $id, value: $value) {
      id
      value
    }
  }
`

export {
  SiteSettingsQuery,
  UpdateSiteSettingMutation,
}