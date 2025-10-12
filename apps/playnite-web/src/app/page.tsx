import Typography from '@mui/material/Typography'
import { User } from '../../.generated/types.generated'
import MainNavigation from '../components/Navigation/MainNavigation'
import { MeQuery } from '../feature/account/queries'
import Header from '../feature/shared/components/Header'
import { Layout } from '../feature/shared/components/Layout'
import { PreloadQuery } from '../feature/shared/gql/client'

async function Index() {
  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          meQueryRef={meQueryRef}
          title={
            <Header>
              <Typography variant="h1">Playnite Web</Typography>
            </Header>
          }
          navs={[MainNavigation]}
        ></Layout>
      )}
    </PreloadQuery>
  )
}

export default Index
