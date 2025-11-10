import { Typography } from '@mui/material'
import LibrariesNavigation from '../../../components/Navigation/LibrariesNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import { UserLibraries } from '../../../feature/library/components/UserLibraries'
import Header from '../../../feature/shared/components/Header'
import { Layout } from '../../../feature/shared/components/Layout'

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
      <UserLibraries username={username} />
    </Layout>
  )
}

export default UserPage
