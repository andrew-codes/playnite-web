'use client'

import { AccountCircle, Home } from '@mui/icons-material'
import { merge } from 'lodash-es'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { useMe } from '../../feature/account/hooks/me'
import { useSignOut } from '../../feature/account/hooks/signOut'
import NavMenu from './NavMenu'

const MainNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const [me] = useMe()
  const [signOut] = useSignOut()
  const handleSignOut = () => {
    signOut()
    me.updateQuery((result) => {
      return merge({}, result, {
        me: { isAuthenticated: false },
      })
    })
  }

  // const location = useLocation()x
  const pathname = usePathname()

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
          to: !me.data?.me?.isAuthenticated
            ? `/login?returnTo=${pathname}`
            : handleSignOut,
          icon: <AccountCircle />,
          text: !me.data?.me?.isAuthenticated ? 'Sign In' : 'Sign Out',
        },
      ]}
    />
  )
}

export default MainNavigation
