import { useQuery } from '@apollo/client/react'
import { LibraryBooks, PlayArrow, Settings } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { useMe } from '../../account/hooks/me'
import { LibraryDetailsQuery } from '../../library/queries'
import NavMenu from './NavMenu'

const LibraryNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const params = useParams()
  const { username, libraryId } = params

  const { data } = useQuery<{ library: { id: string; name: string } }>(
    LibraryDetailsQuery,
    {
      variables: { libraryId },
    },
  )

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

  const [result] = useMe()
  if (
    result?.data?.me?.isAuthenticated &&
    result?.data?.me?.username === username
  ) {
    navItems.push({
      to: `/u/${username}/${libraryId}/settings`,
      icon: <Settings />,
      text: 'Library Settings',
    })
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
