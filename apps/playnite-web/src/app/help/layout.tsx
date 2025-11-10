import { Typography } from '@mui/material'
import MainNavigation from '../../components/Navigation/MainNavigation'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'

export default function Help({ children }: { children: React.ReactNode }) {
  return (
    <Layout
      navs={[MainNavigation]}
      title={
        <Header>
          <Typography variant="h1">Help</Typography>
        </Header>
      }
    >
      <div className="help-page">{children}</div>
    </Layout>
  )
}
