import { LocalLibrary, Sync } from '@mui/icons-material'
import { List, styled } from '@mui/material'
import { useParams } from '@remix-run/react'
import { FC } from 'react'
import NavMenu from './NavMenu'

const NavigationList = styled(List, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  padding: '0 18px',
  width: '100%',
  ...(open && {
    padding: '0 9px',
  }),
  ...(!open && {}),
}))

const LibrariesNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const { username } = useParams<{ username: string }>()

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
      ]}
    />
  )
}

export default LibrariesNavigation
