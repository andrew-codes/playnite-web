import { Typography } from '@mui/material'
import { useParams } from '@remix-run/react'
import { ComponentType } from 'react'
import Permission from '../auth/permissions'
import Layout from '../components/Layout'
import LibrariesNavigation from '../components/Navigation/LibrariesNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import SiteAdminNavigation from '../components/Navigation/SiteAdminNavigation'
import { useMe } from '../hooks'
import {
  requiresAuthorization,
  requiresSameUser,
} from '../server/loaders/requiresAuthorization'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup(
  requiresSameUser(requiresAuthorization(Permission.Write)),
)

const Account = () => {
  const [data, hasPermissions] = useMe()

  if (!data) {
    return null
  }

  const navs: Array<ComponentType<{ open: boolean }>> = [
    LibrariesNavigation,
    MainNavigation,
  ]
  const isSiteAdmin = hasPermissions(Permission.SiteAdmin)
  if (isSiteAdmin) {
    navs.push(SiteAdminNavigation)
  }

  var { username } = useParams()

  return (
    <Layout
      title={<Typography variant="h1">Account</Typography>}
      navs={navs}
    ></Layout>
  )
}

type SearchParams = { username: string }

export default Account
export { loader }
export type { SearchParams }
