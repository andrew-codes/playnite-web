'use client'

import { Alert, Switch, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useSiteSettings } from '../hooks/siteSettings'
import { useUpdateSiteSetting } from '../hooks/updateSiteSettings'

const AdminPanel = () => {
  const settings = useSiteSettings()
  const [updateSetting, result] = useUpdateSiteSetting()

  useEffect(() => {
    if (!result.error) {
      settings.refetch()
    }
  }, [result.error, settings])

  return (
    <>
      <Alert severity="warning" sx={{ mb: 2 }}>
        These settings affect the entire Playnite Web installation and affect
        all users. Settings are saved immediately. Use with caution.
      </Alert>
      {settings.data?.siteSettings.map((setting) => (
        <div data-test="Setting" key={setting.id}>
          <Typography variant="h2">{setting.name}</Typography>
          <Typography variant="body1">{setting.description}</Typography>
          <Switch
            aria-label={setting.name}
            checked={setting.value === 'true'}
            onChange={(evt) =>
              updateSetting({
                variables: {
                  id: setting.id,
                  value: evt.target.checked ? 'true' : 'false',
                },
              })
            }
          />
        </div>
      ))}
    </>
  )
}

export { AdminPanel }