import { Typography } from '@mui/material'
import { User } from '../../../../.generated/types.generated'
import LibrariesNavigation from '../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import { MeQuery, UserLookupQuery } from '../../../feature/account/queries'
import { UserLibraries } from '../../../feature/library/components/UserLibraries'
import Header from '../../../feature/shared/components/Header'
import { Layout } from '../../../feature/shared/components/Layout'
import { PreloadQuery } from '../../../feature/shared/gql/client'

interface UserPageProps {
  params: { username: string }
}

async function UserPage({ params }: UserPageProps) {
  const { username } = await params

  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          meQueryRef={meQueryRef}
          title={
            <Header>
              <Typography variant="h1">Libraries</Typography>
            </Header>
          }
          navs={[LibrariesNavigation, MainNavigation]}
        >
          <PreloadQuery<{ lookupUser: User }, { username: string }>
            query={UserLookupQuery}
            variables={{ username }}
          >
            {(queryRef) => (
              <UserLibraries username={username} queryRef={queryRef} />
            )}
          </PreloadQuery>
        </Layout>
      )}
    </PreloadQuery>
  )
}

export default UserPage
