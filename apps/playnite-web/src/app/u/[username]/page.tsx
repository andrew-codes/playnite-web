import { Typography } from '@mui/material'
import { ensureAccountSetup } from '../../../feature/account/ensureAccountSetup'
import { UserLookupQuery } from '../../../feature/account/hooks/userLookup'
import { UserLibraries } from '../../../feature/libraries/components/UserLibraries'
import LibrariesNavigation from '../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import Header from '../../../feature/shared/components/Header'
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
