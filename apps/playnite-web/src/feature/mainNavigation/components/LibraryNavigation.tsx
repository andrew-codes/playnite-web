import { Games } from '@mui/icons-material'
import { useParams } from 'next/navigation'
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
      ]}
    />
  )
}

type SearchParams = { username: string; libraryId: string }

export default LibraryNavigation
export type { SearchParams }
