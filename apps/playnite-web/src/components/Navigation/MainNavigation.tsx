import { AccountCircle, Home } from '@mui/icons-material'
import { useLocation } from '@remix-run/react'
import { merge } from 'lodash-es'
import { FC } from 'react'
import { useMe } from '../../hooks/me'
import { useSignOut } from '../../hooks/signOut'
import NavMenu from './NavMenu'

const MainNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const [me] = useMe()
  const [signOut] = useSignOut()
  const handleSignOut = () => {
    signOut()
    me.updateQuery((result, opts) => {
      return merge({}, result, {
        isAuthenticated: false,
      })
    })
  }

  const location = useLocation()

  return (
    <NavMenu
      title="Main navigation"
      data-test="MainNavigation"
      open={open}
      navItems={[
        {
          to: '/',
          icon: <Home />,
          text: 'Playnite Web Libraries',
        },
        {
          to: !me.data?.me.isAuthenticated
            ? `/login?returnTo=${location.pathname}`
            : handleSignOut,
          icon: <AccountCircle />,
          text: !me.data?.me.isAuthenticated ? 'Login' : 'Logout',
        },
      ]}
    />
  )
}

export default MainNavigation
