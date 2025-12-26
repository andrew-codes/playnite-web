import { LibraryBooks, PlayArrow, Settings } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { useMe } from '../../account/hooks/me'
import NavMenu from './NavMenu'

const LibraryNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const params = useParams()
  const { username, libraryId } = params

  const [result] = useMe()
  const navItems = [
    {
      to: `/u/${username}/${libraryId}`,
      icon: <LibraryBooks />,
      text: 'Games',
    },
    {
      to: `/u/${username}/${libraryId}/on-deck`,
      icon: <PlayArrow />,
      text: 'On Deck',
    },
  ]

  if (!result?.data?.me || result.data.me.username === username) {
    navItems.push({
      to: `/u/${username}/${libraryId}/settings`,
      icon: <Settings />,
      text: 'Library Settings',
    })
  }

  return (
    <NavMenu
      title={`Library navigation`}
      data-test="LibraryNavigation"
      open={open}
      navItems={navItems}
    />
  )
}

type SearchParams = { username: string; libraryId: string }

export default LibraryNavigation
export type { SearchParams }
