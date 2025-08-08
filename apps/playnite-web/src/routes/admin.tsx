import { Alert, Switch, Typography } from '@mui/material'
import Permission from '../auth/permissions'
import Header from '../components/Header'
import Layout from '../components/Layout'
import LibrariesNavigation from '../components/Navigation/LibrariesNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../components/Navigation/SiteAdminNavigation'
import { useMe } from '../hooks'
import { useSiteSettings } from '../hooks/siteSettings'
import { requiresAuthorization } from '../server/loaders/requiresAuthorization'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup(requiresAuthorization(Permission.SiteAdmin))

const Account = () => {
  const [data, hasPermissions] = useMe()

  if (!data) {
    return null
  }

  const settings = useSiteSettings()

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
            defaultChecked={setting.value === 'true'}
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
