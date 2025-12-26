import { UserLibraries } from '../../../feature/library/components/UserLibraries'
import LibrariesNavigation from '../../../feature/mainNavigation/components/LibrariesNavigation'
import MainNavigation from '../../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../../feature/shared/components/Layout'
import { PageTitle } from '../../../feature/shared/components/PageTitle'

interface UserPageProps {
  params: { username: string }
}

async function UserPage({ params }: UserPageProps) {
  const { username } = await params

  return (
    <Layout navs={[LibrariesNavigation, MainNavigation]}>
      <PageTitle title={`User Libraries - ${username}`} />
      <UserLibraries username={username} />
    </Layout>
  )
}

export default UserPage
