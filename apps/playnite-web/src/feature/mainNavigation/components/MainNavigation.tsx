'use client'

import { AccountCircle, Home } from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { useMe } from '../../account/hooks/me'
import { useSignOut } from '../../account/hooks/signOut'
import NavMenu from './NavMenu'

const MainNavigation: FC<{
  open: boolean
}> = ({ open, ...rest }) => {
  const [result] = useMe()
  const me = result?.data?.me
  const [signOut] = useSignOut()
  const handleSignOut = () => {
    signOut()
  }

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
          to: !me?.isAuthenticated
            ? `/login?returnTo=${pathname}`
            : handleSignOut,
          icon: <AccountCircle />,
          text: !me?.isAuthenticated ? 'Sign In' : 'Sign Out',
        },
      ]}
    />
  )
}

export default MainNavigation
