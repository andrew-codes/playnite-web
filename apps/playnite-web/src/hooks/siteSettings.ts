import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react'
import { SiteSetting } from 'apps/playnite-web/.generated/types.generated'

const GetSiteSettings = gql`
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
  }>(GetSiteSettings)
}

export { GetSiteSettings, useSiteSettings }
