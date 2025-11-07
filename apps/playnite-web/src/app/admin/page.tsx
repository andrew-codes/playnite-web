import { Typography } from '@mui/material'
import { SiteSetting } from '../../../.generated/types.generated'
import LibrariesNavigation from '../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../../components/Navigation/SiteAdminNavigation'
import { AdminPanel } from '../../feature/admin/components/AdminPanel'
import { SiteSettingsQuery } from '../../feature/admin/queries'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'
import { PreloadQuery } from '../../feature/shared/gql/client'

async function Admin() {
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
      <PreloadQuery<{ siteSettings: Array<SiteSetting> }, {}>
        query={SiteSettingsQuery}
      >
        <AdminPanel />
      </PreloadQuery>
    </Layout>
  )
}

export default Admin
