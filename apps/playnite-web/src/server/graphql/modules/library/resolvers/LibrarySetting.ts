import { defaultSettings } from '../../../../librarySetting'
import { create } from '../../../../oid'
import type { LibrarySettingResolvers } from './../../../../../../.generated/types.generated'

export const LibrarySetting: LibrarySettingResolvers = {
  id: async (parent) => {
    return create('LibrarySetting', parent.id).toString()
  },
  name: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.id === parent.name,
      )?.name || ''
    )
  },
  description: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.id === parent.name,
      )?.description || ''
    )
      .split('\n')
      .join('<br />')
  },
  helperText: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.id === parent.name,
      )?.helperText || ''
    )
  },
  code: async (parent) => {
    return (
      Object.values(defaultSettings).find(
        (setting) => setting.id === parent.name,
      )?.id || ''
    )
  },
  value: async (parent) => {
    return JSON.stringify(parent.value)
  },
}
