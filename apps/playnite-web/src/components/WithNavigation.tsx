import { Menu as MenuIcon, PlaylistPlay, Search } from '@mui/icons-material'
import {
  BottomNavigation,
  BottomNavigationAction,
  Link,
  Menu,
  MenuItem,
  styled,
} from '@mui/material'
import { useLocation } from '@remix-run/react'
import { FC, MouseEvent, PropsWithChildren, useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from '../api/client/state/authSlice'

const Layout = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',

  '> *:first-child': {
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    margin: '16px',
  },
}))

const WithNavigation: FC<PropsWithChildren> = ({ children }) => {
  const isAuthenticated = useSelector(getIsAuthenticated)

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const { pathname } = useLocation()
  const [value, setValue] = useState(pathname)
  const handleBottomNavigationChange = useCallback<
    (event: React.SyntheticEvent, value: any) => void
  >((event, newValue) => {
    setValue(newValue)
    if (newValue === 'more') {
      handleClick(event as MouseEvent<HTMLButtonElement>)
    }
  }, [])

  return (
    <Layout>
      <main>{children}</main>
      <BottomNavigation
        showLabels
        value={value}
        onChange={handleBottomNavigationChange}
      >
        <BottomNavigationAction
          href="/"
          label="Playlists"
          value="/"
          icon={<PlaylistPlay />}
        />
        <BottomNavigationAction
          label="Browse"
          icon={<Search />}
          href="/browse"
          value="/browse"
        />
        <BottomNavigationAction label="More" icon={<MenuIcon />} value="more" />
      </BottomNavigation>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {!isAuthenticated && (
          <MenuItem href="/login" component={Link}>
            Sign In
          </MenuItem>
        )}
        {isAuthenticated && (
          <MenuItem href="/logout" component={Link}>
            Sign Out
          </MenuItem>
        )}
      </Menu>
    </Layout>
  )
}

export default WithNavigation
