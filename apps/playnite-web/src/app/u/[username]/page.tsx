'use client'

import { useParams } from 'next/navigation'
import { useMe } from '../../..//feature/account/hooks/me'
import { UserLibraries } from '../../../feature/library/components/UserLibraries'
import AuthenticatedNavigation from '../../../feature/mainNavigation/components/AuthenticatedNavigation'
import LibrariesNavigation from '../../../feature/mainNavigation/components/LibrariesNavigation'
import MainNavigation from '../../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../../feature/shared/components/Layout'
import { PageTitle } from '../../../feature/shared/components/PageTitle'

interface UserPageProps {
  params: { username: string }
}

function UserPage({ params }: UserPageProps) {
  const { username } = useParams()
  const [result] = useMe()

  let navs = [LibrariesNavigation, MainNavigation]
  if (result.data?.me?.isAuthenticated) {
    navs = navs
      .slice(0, 1)
      .concat([AuthenticatedNavigation])
      .concat(navs.slice(1))
  }

  if (!username) {
    throw new Error('Username is required')
  }

  return (
    <Layout navs={navs}>
      <PageTitle title={`User Libraries - ${username}`} />
      <UserLibraries username={username.toString()} />
    </Layout>
  )
}

export default UserPage
