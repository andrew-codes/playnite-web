import { useQuery } from '@apollo/client/react'
import { LibraryBooks, PlayArrow } from '@mui/icons-material'
import { useParams } from 'next/navigation'
import { FC } from 'react'
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
