import { Typography } from '@mui/material'
import Header from '../../components/Header'
import LibrariesNavigation from '../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../../components/Navigation/SiteAdminNavigation'
import { ensureAccountSetup } from '../../feature/account/ensureAccountSetup'
import { requiresAuthorization } from '../../feature/admin/auth'
import { AdminPanel } from '../../feature/admin/components/AdminPanel'
import { SiteSettingsQuery } from '../../feature/admin/hooks/siteSettings'
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
      <PreloadQuery query={SiteSettingsQuery}>
        <AdminPanel />
      </PreloadQuery>
    </Layout>
  )
}

export default ensureAccountSetup(requiresAuthorization(Admin))
