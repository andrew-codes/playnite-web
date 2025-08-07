import { FC } from 'react'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'

const HelpSyncLibrary: FC<{}> = () => {
  return (
    <Layout navs={[MainNavigation]}>
      <div className="help-sync-library">
        <h2>Sync Library</h2>
        <p>Here you can manage your library synchronization settings.</p>
      </div>
    </Layout>
  )
}

export default HelpSyncLibrary
