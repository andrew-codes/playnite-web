import { Typography } from '@mui/material'
import { User } from 'apps/playnite-web/.generated/types.generated'
import { requiresAuthorization } from 'apps/playnite-web/src/feature/account/auth'
import { UserSettings } from 'apps/playnite-web/src/feature/account/components/UserSettings'
import { ensureAccountSetup } from 'apps/playnite-web/src/feature/account/ensureAccountSetup'
import { MeQuery } from 'apps/playnite-web/src/feature/account/hooks/me'
import Permission, {
  userHasPermission,
} from 'apps/playnite-web/src/feature/authorization/permissions'
import { PreloadQuery } from 'apps/playnite-web/src/feature/shared/gql/client'
import { ComponentType } from 'react'
import Header from '../../../../components/Header'
import LibrariesNavigation from '../../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../../../../components/Navigation/SiteAdminNavigation'
import { Layout } from '../../../../feature/shared/components/Layout'

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
