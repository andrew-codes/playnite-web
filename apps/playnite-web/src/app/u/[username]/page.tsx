import { Typography } from '@mui/material'
import { ensureAccountSetup } from 'apps/playnite-web/src/feature/account/ensureAccountSetup'
import { UserLookupQuery } from 'apps/playnite-web/src/feature/account/hooks/userLookup'
import { UserLibraries } from 'apps/playnite-web/src/feature/libraries/components/UserLibraries'
import Header from '../../../components/Header'
import LibrariesNavigation from '../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import { Layout } from '../../../feature/shared/components/Layout'
import { PreloadQuery } from '../../../feature/shared/gql/client'

interface UserPageProps {
  params: { username: string }
}

async function UserPage({ params }: UserPageProps) {
  const { username } = await params

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Libraries</Typography>
        </Header>
      }
      navs={[LibrariesNavigation, MainNavigation]}
    >
      <PreloadQuery query={UserLookupQuery} variables={{ username }}>
        <UserLibraries username={username} />
      </PreloadQuery>
    </Layout>
  )
}

export default ensureAccountSetup(UserPage)
