import MainNavigation from '../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../feature/shared/components/Layout'

export default function Help({ children }: { children: React.ReactNode }) {
  return (
    <Layout navs={[MainNavigation]}>
      <div className="help-page">{children}</div>
    </Layout>
  )
}
