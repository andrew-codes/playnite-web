import { useQuery } from '@apollo/client/react'
import { SiteSetting } from '../../../../.generated/types.generated'
import { SiteSettingsQuery } from '../queries'

const useSiteSettings = () => {
  return useQuery<{
    siteSettings: Array<SiteSetting>
  }>(SiteSettingsQuery)
}

export { useSiteSettings }
