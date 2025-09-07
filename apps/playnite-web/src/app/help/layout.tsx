import { Typography } from '@mui/material'
import { User } from '../../../.generated/types.generated'
import MainNavigation from '../../components/Navigation/MainNavigation'
import { MeQuery } from '../../feature/account/queries'
import Header from '../../feature/shared/components/Header'
import { Layout } from '../../feature/shared/components/Layout'
import { PreloadQuery } from '../../feature/shared/gql/client'

export default function Help({ children }: { children: React.ReactNode }) {
  return (
    <PreloadQuery<{ me: User }, {}> query={MeQuery}>
      {(meQueryRef) => (
        <Layout
          navs={[MainNavigation]}
          meQueryRef={meQueryRef}
          title={
            <Header>
              <Typography variant="h1">Help</Typography>
            </Header>
          }
        >
          <div className="help-page">{children}</div>
        </Layout>
      )}
    </PreloadQuery>
  )
}
