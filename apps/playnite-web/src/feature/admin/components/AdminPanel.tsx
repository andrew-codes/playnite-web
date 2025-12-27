'use client'

import { useQuery } from '@apollo/client/react'
import { Alert, Switch, Typography } from '@mui/material'
import { merge } from 'lodash-es'
import { FC, useMemo } from 'react'
import { SiteSetting } from '../../../../.generated/types.generated'
import { PageTitle } from '../../shared/components/PageTitle'
import { useUpdateSiteSetting } from '../hooks/updateSiteSettings'
import { SiteSettingsQuery } from '../queries'

const AdminPanel: FC<{}> = ({}) => {
  const { data } = useQuery<{ siteSettings: Array<SiteSetting> }>(
    SiteSettingsQuery,
  )
  const settings = useMemo(
    () =>
      (data?.siteSettings ?? []).map((setting) =>
        merge({}, setting, {
          value: JSON.parse(setting.value),
        }),
      ),
    [data],
  )
  const [updateSetting, result] = useUpdateSiteSetting()

  return (
    <>
      <PageTitle title="Site-Wide Administration" />
      <div>
        <Alert severity="warning" sx={{ mb: 2 }}>
          These settings affect the entire Playnite Web installation and affect
          all users. Settings are saved immediately. Use with caution.
        </Alert>
        {settings.map((setting) => (
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
    </>
  )
}

export { AdminPanel }
