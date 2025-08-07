import { Grid, Typography } from '@mui/material'
import { useParams } from '@remix-run/react'
import { isEmpty } from 'lodash-es'
import Header from '../components/Header'
import Layout from '../components/Layout'
import { Link } from '../components/Link'
import LibrariesNavigation from '../components/Navigation/LibrariesNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import { useUserLookup } from '../queryHooks/userLookup'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

function Index() {
  const params = useParams<{ username: string }>()
  const data = useUserLookup(params.username ?? '')

  const userData = data.data
  const loading = data.loading

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h2">Libraries</Typography>
        </Header>
      }
      navs={[LibrariesNavigation, MainNavigation]}
    >
      {!loading && isEmpty(userData?.lookupUser.libraries) && (
        <Typography>
          No libraries found for this user.
          <br />
          <Link to="/help/sync-library">Sync your Library</Link>
        </Typography>
      )}
      {!loading && !isEmpty(userData?.lookupUser.libraries) && (
        <Grid container spacing={2}>
          {userData?.lookupUser.libraries.map((library, i) => (
            <Grid key={library.id} size={3}>
              <div>
                <Link to={`/u/${params.username}/${library.id}`}>
                  <Typography>{library.name ?? `Library ${i + 1}`}</Typography>
                </Link>
              </div>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  )
}

export default Index
export { loader }
