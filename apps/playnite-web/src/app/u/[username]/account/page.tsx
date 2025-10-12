import { Typography } from '@mui/material'
import { User } from '../../../../../.generated/types.generated'
import LibrariesNavigation from '../../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../../../../components/Navigation/SiteAdminNavigation'
import { UserSettings } from '../../../../feature/account/components/UserSettings'
import { MeQuery } from '../../../../feature/account/queries'
import Permission, {
  userHasPermission,
} from '../../../../feature/authorization/permissions'
import Header from '../../../../feature/shared/components/Header'
import { Layout } from '../../../../feature/shared/components/Layout'
import { PreloadQuery } from '../../../../feature/shared/gql/client'

async function Account(props: { params: { username: string }; me: User }) {
  const navs = [LibrariesNavigation, MainNavigation]
  const isSiteAdmin = userHasPermission(props.me, Permission.SiteAdmin)
  if (isSiteAdmin) {
    navs.push(SiteAdminNavigation)
  }

  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          meQueryRef={meQueryRef}
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
          <PreloadQuery<{ me: User }, {}> query={MeQuery}>
            {(queryRef) => <UserSettings queryRef={queryRef} />}
          </PreloadQuery>
        </Layout>
      )}
    </PreloadQuery>
  )
}

export default Account
