'use client'

import { LocalLibrary } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import NavMenu from './NavMenu'

const LibrariesNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const { username } = useParams()

  const navItems = [
    {
      to: `/u/${username}`,
      icon: <LocalLibrary />,
      text: `Libraries`,
    },
  ]

  return (
    <>
      <NavMenu
        title={`Libraries - ${username}`}
        data-test="LibrariesNavigation"
        open={open}
        navItems={navItems}
      />
    </>
  )
}

type SearchParams = { username: string }

export default LibrariesNavigation
export type { SearchParams }
