import Typography from '@mui/material/Typography'
import MainNavigation from '../feature/mainNavigation/components/MainNavigation'
import Header from '../feature/shared/components/Header'
import { Layout } from '../feature/shared/components/Layout'

async function NotFound() {
  return (
    <Layout
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
  )
}

export default NotFound
