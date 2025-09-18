import Typography from '@mui/material/Typography'
import Header from '../components/Header'
import MainNavigation from '../components/Navigation/MainNavigation'
import { ensureAccountSetup } from '../feature/account/ensureAccountSetup'
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

export default ensureAccountSetup(Index)
