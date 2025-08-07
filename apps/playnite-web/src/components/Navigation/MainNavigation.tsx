import { AccountCircle, Home } from '@mui/icons-material'
import { List, styled } from '@mui/material'
import { useLocation } from '@remix-run/react'
import { merge } from 'lodash-es'
import { FC } from 'react'
import { useMe, useSignOut } from '../../queryHooks'
import NavMenu from './NavMenu'

const NavigationList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  padding: '0 18px',
  width: '100%',
  ...(open && {
    padding: '0 9px',
  }),
  ...(!open && {}),
}))

const MainNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const me = useMe()
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
