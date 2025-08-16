import { Typography } from '@mui/material'
import { Outlet } from '@remix-run/react'
import { FC } from 'react'
import Header from '../components/Header'
import Layout from '../components/Layout'
import MainNavigation from '../components/Navigation/MainNavigation'

const Help: FC<{}> = () => {
  return (
    <Layout
      navs={[MainNavigation]}
      title={
        <Header>
          <Typography variant="h1">Help</Typography>
        </Header>
      }
    >
      <div className="help-page">
        <Outlet />
      </div>
    </Layout>
  )
}

export default Help
