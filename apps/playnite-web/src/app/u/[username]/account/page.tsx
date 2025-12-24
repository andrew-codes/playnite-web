import { Typography } from '@mui/material'
import { User } from '../../../../../.generated/types.generated'
import LibrariesNavigation from '../../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../../../../components/Navigation/SiteAdminNavigation'
import { UserSettings } from '../../../../feature/account/components/UserSettings'
import Permission, {
  userHasPermission,
} from '../../../../feature/authorization/permissions'
import Header from '../../../../feature/shared/components/Header'
import { Layout } from '../../../../feature/shared/components/Layout'

async function Account(props: { params: { username: string }; me: User }) {
  const navs = [LibrariesNavigation, MainNavigation]
  const isSiteAdmin = userHasPermission(props.me, Permission.SiteAdmin)
  if (isSiteAdmin) {
    navs.push(SiteAdminNavigation)
  }

  return (
    <Layout
      title={
        <Header>
          <div>
            <Typography variant="h1">User Settings</Typography>
            <Typography variant="subtitle1"></Typography>
          </div>
        </Header>
      }
      navs={navs}
    >
      <UserSettings />
    </Layout>
  )
}

export default Account
