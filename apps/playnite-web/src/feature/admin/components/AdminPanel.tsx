'use client'

import { useQuery } from '@apollo/client/react'
import { Alert, Switch, Typography } from '@mui/material'
import { FC } from 'react'
import { SiteSetting } from '../../../../.generated/types.generated'
import { useUpdateSiteSetting } from '../hooks/updateSiteSettings'
import { SiteSettingsQuery } from '../queries'

const AdminPanel: FC<{}> = ({}) => {
  const settings = useQuery<{ siteSettings: Array<SiteSetting> }>(
    SiteSettingsQuery,
  )
  const [updateSetting, result] = useUpdateSiteSetting()

  return (
    <div>
      <Alert severity="warning" sx={{ mb: 2 }}>
        These settings affect the entire Playnite Web installation and affect
        all users. Settings are saved immediately. Use with caution.
      </Alert>
      {settings?.data?.siteSettings.map((setting) => (
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
    </div>
  )
}

export { AdminPanel }
