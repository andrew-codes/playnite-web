import MainNavigation from '../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../feature/shared/components/Layout'

async function Index() {
  return <Layout navs={[MainNavigation]}></Layout>
}

export default Index
