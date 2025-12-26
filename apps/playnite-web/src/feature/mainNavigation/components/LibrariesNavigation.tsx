'use client'

import { LocalLibrary, Settings, Sync } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { useMe } from '../../account/hooks/me'
import NavMenu from './NavMenu'

const LibrariesNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const { username } = useParams()

  const [result] = useMe()
  const navItems = [
    {
      to: `/u/${username}`,
      icon: <LocalLibrary />,
      text: 'My Libraries',
    },
    {
      to: `/help/sync-library`,
      icon: <Sync />,
      text: 'Sync Library',
    },
  ]
  if (!result?.data?.me || result.data.me.username === username) {
    navItems.push({
      to: `/u/${username}/account`,
      icon: <Settings />,
      text: 'Account Settings',
    })
  }

  return (
    <NavMenu
      title="Libraries navigation"
      data-test="LibrariesNavigation"
      open={open}
      navItems={navItems}
    />
  )
}

type SearchParams = { username: string }

export default LibrariesNavigation
export type { SearchParams }
