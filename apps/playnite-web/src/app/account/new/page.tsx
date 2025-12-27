import { RegistrationForm } from '../../../feature/account/components/RegistrationForm'
import MainNavigation from '../../../feature/mainNavigation/components/MainNavigation'
import { Layout } from '../../../feature/shared/components/Layout'

async function Registration() {
  return (
    <Layout navs={[MainNavigation]}>
      <RegistrationForm />
    </Layout>
  )
}

export default Registration
