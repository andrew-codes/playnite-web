import { Alert, Switch, Typography } from '@mui/material'
import { useEffect } from 'react'
import Permission from '../auth/permissions'
import Header from '../components/Header'
import Layout from '../components/Layout'
import LibrariesNavigation from '../components/Navigation/LibrariesNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../components/Navigation/SiteAdminNavigation'
import { useMe } from '../hooks/me'
import { useSiteSettings } from '../hooks/siteSettings'
import { updateSiteSetting } from '../hooks/updateSiteSettings'
import { requiresAuthorization } from '../server/loaders/requiresAuthorization'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup(requiresAuthorization(Permission.SiteAdmin))

const Account = () => {
  const [data, hasPermissions] = useMe()

  if (!data) {
    return null
  }

  const settings = useSiteSettings()
  const [updateSetting, result] = updateSiteSetting()
  useEffect(() => {
    if (!result.error) {
      settings.refetch()
    }
  }, [result.error, settings])

  return (
    <Layout
      title={
        <Header>
          <div>
            <Typography variant="h1">Site-wide Administration</Typography>
            <Typography variant="subtitle1"></Typography>
          </div>
        </Header>
      }
      navs={[LibrariesNavigation, MainNavigation, SiteAdminNavigation]}
    >
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
    </Layout>
  )
}

type SearchParams = { username: string }

export default Account
export { loader }
export type { SearchParams }
