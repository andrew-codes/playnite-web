import { Typography } from '@mui/material'
import { ComponentType } from 'react'
import { User } from '../../../../../.generated/types.generated'
import LibrariesNavigation from '../../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../../../../components/Navigation/SiteAdminNavigation'
import { requiresAuthorization } from '../../../../feature/account/auth'
import { UserSettings } from '../../../../feature/account/components/UserSettings'
import { ensureAccountSetup } from '../../../../feature/account/ensureAccountSetup'
import { MeQuery } from '../../../../feature/account/hooks/me'
import Permission, {
  userHasPermission,
} from '../../../../feature/authorization/permissions'
import Header from '../../../../feature/shared/components/Header'
import { Layout } from '../../../../feature/shared/components/Layout'
import { PreloadQuery } from '../../../../feature/shared/gql/client'

async function Account(props: { params: { username: string }; me: User }) {
  const navs: Array<ComponentType<{ open: boolean }>> = [
    LibrariesNavigation,
    MainNavigation,
  ]
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
      <PreloadQuery query={MeQuery}>
        <UserSettings />
      </PreloadQuery>
    </Layout>
  )
}

export default ensureAccountSetup(requiresAuthorization(Account))
