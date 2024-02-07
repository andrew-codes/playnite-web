import { Home, LocalLibrary } from '@mui/icons-material'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  useTheme,
} from '@mui/material'
import { useNavigate } from '@remix-run/react'
import { FC } from 'react'

const Navigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  flex: 1,
  height: '100%',
}))

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

const MainNavigation: FC<{ open: boolean }> = ({ open, ...rest }) => {
  const navigate = useNavigate()
  const handleNavigation = (href: string) => (evt: any) => {
    evt.preventDefault()
    navigate(href)
  }

  const theme = useTheme()

  return (
    <Navigation
      sx={{
        style: {
          marginTop: '28px',
        },
      }}
      {...rest}
    >
      <NavigationList open={open}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleNavigation('/')}
            sx={{
              minHeight: theme.spacing(6),
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <Home />
            </ListItemIcon>
            <ListItemText
              primary={'Playnite Web'}
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={handleNavigation('/browse')}
            sx={{
              minHeight: theme.spacing(6),
              justifyContent: open ? 'initial' : 'center',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
              }}
            >
              <LocalLibrary />
            </ListItemIcon>
            <ListItemText
              primary={'My Games'}
              secondary={'Games in library'}
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        </ListItem>
      </NavigationList>
    </Navigation>
  )
}

export default MainNavigation
