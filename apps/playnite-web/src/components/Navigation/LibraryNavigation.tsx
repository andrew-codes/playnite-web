import { Games, LocalLibrary } from '@mui/icons-material'
import { useParams } from '@remix-run/react'
import { FC } from 'react'
import NavMenu from './NavMenu'

const LibraryNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const params = useParams()
  const { username, libraryId } = params

  return (
    <NavMenu
      title={`Library navigation`}
      data-test="LibraryNavigation"
      open={open}
      navItems={[
        {
          to: `/u/${username}/${libraryId}`,
          icon: <Games />,
          text: 'Games',
        },
        {
          to: `/u/${username}`,
          icon: <LocalLibrary />,
          text: 'Back to Libraries',
        },
      ]}
    />
  )
}

type SearchParams = { username: string; libraryId: string }

export default LibraryNavigation
export type { SearchParams }
