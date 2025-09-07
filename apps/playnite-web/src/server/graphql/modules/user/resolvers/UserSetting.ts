import { create } from '../../../../oid'
import { defaultSettings } from '../../../../userSettings'
import type { UserSettingResolvers } from './../../../../../../.generated/types.generated'

export const UserSetting: UserSettingResolvers = {
  id: async (parent) => {
    return create('UserSetting', parent.id).toString()
  },
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
  code: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.name === parent.name,
      )?.id || ''
    )
  },
}
