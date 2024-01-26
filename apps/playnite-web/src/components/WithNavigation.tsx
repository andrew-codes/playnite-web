import {
  AccountCircle,
  Home,
  Menu as MenuIcon,
  PlaylistPlay,
  Search as SearchIcon,
} from '@mui/icons-material'
import {
  AppBar,
  IconButton,
  InputBase,
  Link,
  Menu,
  MenuItem,
  Toolbar,
  alpha,
  styled,
} from '@mui/material'
import { useLocation } from '@remix-run/react'
import _ from 'lodash'
import {
  ChangeEvent,
  FC,
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import { $path } from 'remix-routes'
import { getIsAuthenticated } from '../api/client/state/authSlice'
import { Game } from '../api/playnite/types'

const { debounce, merge, stubTrue } = _

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('phone')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}))

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('phone')]: {
      width: '14ch',
      '&:focus': {
        width: '26ch',
      },
    },
  },
}))

const Spacer = styled('div')(({ theme }) => ({ flex: 1 }))

const WithNavigation: FC<
  PropsWithChildren & {
    onFilter?: (id: string, filterFn: (game: Game) => boolean) => void
  }
> = ({ children, onFilter = stubTrue }) => {
  const handleOnChange = useCallback(
    debounce((evt: ChangeEvent<HTMLInputElement>) => {
      onFilter(evt.target.value, (game) =>
        game.name.toLowerCase().includes(evt.target.value.toLowerCase()),
      )
    }, 850),
    [],
  )

  const { pathname } = useLocation()
  const isAuthenticated = useSelector(getIsAuthenticated)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton>
            <MenuIcon />
          </IconButton>
          <IconButton href="/">
            <Home />
          </IconButton>
          <IconButton href="/browse">
            <PlaylistPlay />
          </IconButton>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              inputProps={{ 'aria-label': 'search' }}
              placeholder="Search by name"
              onChange={handleOnChange}
            />
          </Search>
          <Spacer />
          <IconButton onClick={handleClick}>
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {!isAuthenticated && (
          <MenuItem
            href={$path('/login', { returnTo: pathname })}
            component={Link}
          >
            Sign In
          </MenuItem>
        )}
        {isAuthenticated && (
          <MenuItem
            href={$path('/logout', { returnTo: pathname })}
            component={Link}
          >
            Sign Out
          </MenuItem>
        )}
      </Menu>
      <main>{children}</main>
    </>
  )
}

export default WithNavigation
