import { defaultSettings } from '../../../../librarySetting'
import { create } from '../../../../oid'
import type { LibrarySettingResolvers } from './../../../../../../.generated/types.generated'

export const LibrarySetting: LibrarySettingResolvers = {
  id: async (parent) => {
    return create('LibrarySetting', parent.id).toString()
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
  value: async (parent) => {
    return JSON.stringify(parent.value)
  },
}
