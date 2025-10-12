import Typography from '@mui/material/Typography'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'

async function Forbidden() {
  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Forbidden...</Typography>
        </Header>
      }
      navs={[]}
    >
      <Typography variant="body1">
        You are not authorized to view this page.
      </Typography>
    </Layout>
  )
}

export default Forbidden
