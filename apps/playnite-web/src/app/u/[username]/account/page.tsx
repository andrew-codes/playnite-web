import { User } from '../../../../../.generated/types.generated'
import { UserSettings } from '../../../../feature/account/components/UserSettings'
import Permission, {
  userHasPermission,
} from '../../../../feature/authorization/permissions'
import LibrariesNavigation from '../../../../feature/mainNavigation/components/LibrariesNavigation'
import MainNavigation from '../../../../feature/mainNavigation/components/MainNavigation'
import SiteAdminNavigation from '../../../../feature/mainNavigation/components/SiteAdminNavigation'
import { Layout } from '../../../../feature/shared/components/Layout'

async function Account(props: { params: { username: string }; me: User }) {
  const navs = [LibrariesNavigation, MainNavigation]
  const isSiteAdmin = userHasPermission(props.me, Permission.SiteAdmin)
  if (isSiteAdmin) {
    navs.push(SiteAdminNavigation)
  }

  return (
    <Layout navs={navs}>
      <UserSettings />
    </Layout>
  )
}

export default Account
