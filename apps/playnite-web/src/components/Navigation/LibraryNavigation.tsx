import { Games, LocalLibrary } from '@mui/icons-material'
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

const LibraryNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const params = useParams<{ username: string; libraryId: string }>()
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

export default LibraryNavigation
