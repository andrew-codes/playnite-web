'use client'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { useMe } from '../../feature/account/hooks/me'
import AuthenticatedNavigation from '../../feature/mainNavigation/components/AuthenticatedNavigation'
import LibrariesNavigation from '../../feature/mainNavigation/components/LibrariesNavigation'
import MainNavigation from '../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../feature/shared/components/Layout'
import { Link } from '../../feature/shared/components/Link'
import { PageTitle } from '../../feature/shared/components/PageTitle'

function AboutPage() {
  const [result] = useMe()

  let navs = [LibrariesNavigation, MainNavigation]
  if (result.data?.me?.isAuthenticated) {
    navs = navs
      .slice(0, 1)
      .concat([AuthenticatedNavigation])
      .concat(navs.slice(1))
  }

  return (
    <Layout navs={navs}>
      <PageTitle title={`About`} />
      <List>
        <ListItem>
          <Link href="https://github.com/andrew-codes/playnite-web/tree/main/docs">
            Playnite Web documentation website
          </Link>
          <Link href="https://github.com/andrew-codes/playnite-web/issues">
            File a defect or request a feature
          </Link>
          <Link href="https://discord.gg/SSqRj3EKyt">
            Discord server for support and discussion
          </Link>
        </ListItem>
      </List>
    </Layout>
  )
}

export default AboutPage
