import { LocalLibrary, Settings, Sync } from '@mui/icons-material'
import { useParams } from '@remix-run/react'
import { FC } from 'react'
import NavMenu from './NavMenu'

const LibrariesNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const { username } = useParams()

  return (
    <NavMenu
      title="Libraries navigation"
      data-test="LibrariesNavigation"
      open={open}
      navItems={[
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
        {
          to: `/u/${username}/account`,
          icon: <Settings />,
          text: 'Account Settings',
        },
      ]}
    />
  )
}

type SearchParams = { username: string }

export default LibrariesNavigation
export type { SearchParams }
