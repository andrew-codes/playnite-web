import Typography from '@mui/material/Typography'
import MainNavigation from '../components/Navigation/MainNavigation'
import Header from '../feature/shared/components/Header'
import { Layout } from '../feature/shared/components/Layout'

async function Index() {
  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Playnite Web</Typography>
        </Header>
      }
      navs={[MainNavigation]}
    ></Layout>
  )
}

export default Index
