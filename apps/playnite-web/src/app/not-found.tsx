import Typography from '@mui/material/Typography'
import { User } from '../../.generated/types.generated'
import MainNavigation from '../components/Navigation/MainNavigation'
import { MeQuery } from '../feature/account/queries'
import Header from '../feature/shared/components/Header'
import { Layout } from '../feature/shared/components/Layout'
import { PreloadQuery } from '../feature/shared/gql/client'

async function NotFound() {
  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          meQueryRef={meQueryRef}
          title={
            <Header>
              <Typography variant="h1">Not Found</Typography>
            </Header>
          }
          navs={[MainNavigation]}
        >
          <Typography variant="body1">
            This is not the page you are looking for...
            <br />
            <br />
            Or more precisely, the page you are looking for does not exist.
          </Typography>
        </Layout>
      )}
    </PreloadQuery>
  )
}

export default NotFound
