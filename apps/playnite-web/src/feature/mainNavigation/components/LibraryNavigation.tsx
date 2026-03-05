import { useQuery } from '@apollo/client/react'
import {
  LibraryBooks,
  ModeEdit,
  PlayArrow,
  Settings,
} from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC, ReactNode } from 'react'
import { useMe } from '../../account/hooks/me'
import { LibraryDetailsQuery } from '../../library/queries'
import NavMenu from './NavMenu'

const LibraryNavigation: FC<{ open: boolean; navigate?: (path: string) => void }> = ({ open, navigate: navigateProp }) => {
  const params = useParams()
  const { username, libraryId } = params

  const { data } = useQuery<{ library: { id: string; name: string } }>(
    LibraryDetailsQuery,
    {
      variables: { libraryId },
    },
  )

  const makeItem = (text: string, icon: ReactNode, relativePath: string, absolutePath: string) => ({
    icon,
    text,
    to: navigateProp ? () => navigateProp(relativePath) : absolutePath,
  })

  const navItems = [
    makeItem('Games', <LibraryBooks />, '/', `/u/${username}/${libraryId}`),
    makeItem('On Deck', <PlayArrow />, '/on-deck', `/u/${username}/${libraryId}/on-deck`),
  ]

  const [result] = useMe()
  if (
    !navigateProp &&
    result?.data?.me?.isAuthenticated &&
    result?.data?.me?.username === username
  ) {
    navItems.push(makeItem('Manage Library', <ModeEdit />, '/manage', `/u/${username}/${libraryId}/manage`))
    navItems.push(makeItem('Library Settings', <Settings />, '/settings', `/u/${username}/${libraryId}/settings`))
  }

  return (
    <NavMenu
      title={`${data?.library?.name || 'Library'} - ${username}`}
      data-test="LibraryNavigation"
      open={open}
      navItems={navItems}
    />
  )
}

type SearchParams = { username: string; libraryId: string }

export default LibraryNavigation
export type { SearchParams }
