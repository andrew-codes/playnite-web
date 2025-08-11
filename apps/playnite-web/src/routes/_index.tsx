import { Typography } from '@mui/material'
import { LoaderFunction } from '@remix-run/node'
import Header from '../components/Header'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader: LoaderFunction = requiresUserSetup()

function Index() {
  return (
    <>
      <Layout
        title={
          <Header>
            <Typography variant="h1">Playnite Web</Typography>
          </Header>
        }
        navs={[MainNavigation]}
      ></Layout>
    </>
  )
}

export default Index
export { loader }
