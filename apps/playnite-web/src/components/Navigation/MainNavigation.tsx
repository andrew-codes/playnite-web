'use client'

import { QueryRef, useReadQuery } from '@apollo/client/react'
import { AccountCircle, Home } from '@mui/icons-material'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { User } from '../../../.generated/types.generated'
import { useSignOut } from '../../feature/account/hooks/signOut'
import NavMenu from './NavMenu'

const MainNavigation: FC<{
  open: boolean
  meQueryRef: QueryRef<{ me: User }>
}> = ({ open, meQueryRef, ...rest }) => {
  const { data } = useReadQuery(meQueryRef)
  const me = data.me
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
