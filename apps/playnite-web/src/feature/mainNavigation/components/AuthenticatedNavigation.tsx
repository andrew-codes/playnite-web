import { LocalLibrary, Settings } from '@mui/icons-material'
import { FC } from 'react'
import { useMe } from '../../account/hooks/me'
import NavMenu from './NavMenu'

const AuthenticatedNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const [result] = useMe()
  const navItems = [
    {
      to: `/u/${result.data?.me?.username}`,
      icon: <LocalLibrary />,
      text: 'My Libraries',
    },
    {
      to: `/u/${result.data?.me?.username}/account`,
      icon: <Settings />,
      text: 'Account Settings',
    },
  ]

  return (
    <NavMenu
      title={`My Libraries`}
      data-test="MyLibrariesNavigation"
      open={open}
      navItems={navItems}
    />
  )
}

type SearchParams = { username: string; libraryId: string }

export default AuthenticatedNavigation
export type { SearchParams }
