import { defaultSettings } from '../../../../siteSettings'
import type { SiteSettingResolvers } from './../../../../../../.generated/types.generated'

export const SiteSetting: SiteSettingResolvers = {
  description: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.name === parent.name,
      )?.description || ''
    )
  },
}
