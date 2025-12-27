'use client'

import { Typography } from '@mui/material'
import { useMe } from '../feature/account/hooks/me'
import AuthenticatedNavigation from '../feature/mainNavigation/components/AuthenticatedNavigation'
import MainNavigation from '../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../feature/shared/components/Layout'
import { Link } from '../feature/shared/components/Link'
import { PageTitle } from '../feature/shared/components/PageTitle'

function Index() {
  const [result] = useMe()

  const navs = [MainNavigation]
  if (result.data?.me?.isAuthenticated) {
    navs.unshift(AuthenticatedNavigation)
  }

  return (
    <Layout navs={navs}>
      <PageTitle
        title="Welcome to Playnite Web"
        subtitle="Manage and view your game libraries online."
      />
      <Typography variant="body1">
        Please <Link href="/login">sign-in</Link> to get started.
      </Typography>
    </Layout>
  )
}

export default Index
