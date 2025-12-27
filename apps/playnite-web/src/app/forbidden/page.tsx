import Typography from '@mui/material/Typography'
import MainNavigation from '../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../feature/shared/components/Layout'
import { PageTitle } from '../../feature/shared/components/PageTitle'

async function Forbidden() {
  return (
    <Layout navs={[MainNavigation]}>
      <PageTitle title="Forbidden" />
      <Typography variant="body1">
        You are not authorized to view this page.
      </Typography>
    </Layout>
  )
}

export default Forbidden
