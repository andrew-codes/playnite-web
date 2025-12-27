import { SiteSetting } from '../../../.generated/types.generated'
import { AdminPanel } from '../../feature/admin/components/AdminPanel'
import { SiteSettingsQuery } from '../../feature/admin/queries'
import LibrariesNavigation from '../../feature/mainNavigation/components/LibrariesNavigation'
import MainNavigation from '../../feature/mainNavigation/components/MainNavigation'
import SiteAdminNavigation from '../../feature/mainNavigation/components/SiteAdminNavigation'
import { Layout } from '../../feature/shared/components/Layout'
import { PreloadQuery } from '../../feature/shared/gql/client'

async function Admin() {
  return (
    <Layout navs={[LibrariesNavigation, MainNavigation, SiteAdminNavigation]}>
      <PreloadQuery<{ siteSettings: Array<SiteSetting> }, {}>
        query={SiteSettingsQuery}
      >
        <AdminPanel />
      </PreloadQuery>
    </Layout>
  )
}

export default Admin
