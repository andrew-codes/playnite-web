import { defaultSettings } from '../../../../userSettings.js'
import type { UserSettingResolvers } from './../../../../../../.generated/types.generated'

export const UserSetting: UserSettingResolvers = {
  description: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.name === parent.name,
      )?.description || ''
    )
      .split('\n')
      .join('<br />')
  },
  helperText: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.name === parent.name,
      )?.helperText || ''
    )
  },
}
