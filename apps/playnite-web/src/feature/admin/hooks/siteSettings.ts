import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { SiteSetting } from '../../../../.generated/types.generated'

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

const useSiteSettings = () => {
  return useQuery<{
    siteSettings: Array<SiteSetting>
  }>(SiteSettingsQuery)
}

export { SiteSettingsQuery, useSiteSettings }
