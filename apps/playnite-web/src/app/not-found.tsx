import Typography from '@mui/material/Typography'
import MainNavigation from '../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../feature/shared/components/Layout'
import { PageTitle } from '../feature/shared/components/PageTitle'

async function NotFound() {
  return (
    <Layout navs={[MainNavigation]}>
      <PageTitle title="Not Found" />
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
