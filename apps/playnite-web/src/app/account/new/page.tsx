import { Typography } from '@mui/material'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import { RegistrationForm } from '../../../feature/account/components/RegistrationForm'
import Header from '../../../feature/shared/components/Header'
import { Layout } from '../../../feature/shared/components/Layout'

async function Registration() {
  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">Create Account</Typography>
        </Header>
      }
      navs={[MainNavigation]}
    >
      <RegistrationForm />
    </Layout>
  )
}

export default Registration
