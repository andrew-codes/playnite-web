import { useMutation } from '@apollo/client/react'
import { SiteSetting } from '../../../../.generated/types.generated'
import { UpdateSiteSettingMutation } from '../queries'

const useUpdateSiteSetting = () => {
  return useMutation<{
    updateSiteSetting: SiteSetting
  }>(UpdateSiteSettingMutation)
}

export { useUpdateSiteSetting }
