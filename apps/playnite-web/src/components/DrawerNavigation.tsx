import {
  ChevronLeft,
  ChevronRight,
  Home,
  LibraryBooks,
} from '@mui/icons-material'
import {
  Box,
  CSSObject,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer as MuiDrawer,
  Theme,
  styled,
  useTheme,
} from '@mui/material'
import { useNavigate } from '@remix-run/react'
import { FC, PropsWithChildren, useState } from 'react'

const drawerWidth = 240
const openedMixin = (theme: Theme, additionalWidth: number = 0): CSSObject => ({
  width: `calc(${drawerWidth}px + ${additionalWidth}px)`,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme, additionalWidth: number = 0): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + ${additionalWidth}px + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(10)} + ${additionalWidth}px + 1px)`,
  },
})

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      border: 'none',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: '24px',
        bottom: 0,
        width: '1px',
        zIndex: 1300,
        backgroundColor: theme.palette.divider,
      },
      ...openedMixin(theme),
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      border: 'none',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: '24px',
        bottom: 0,
        width: '1px',
        zIndex: 1300,
        backgroundColor: theme.palette.divider,
      },
      ...closedMixin(theme, 24),
    },
  }),
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: 0,
  position: 'absolute',
  right: 0,
  top: `24px`,
  zIndex: 1400,
  ...theme.mixins.toolbar,
}))

const DrawerButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
}))

const DrawerBody = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  position: 'fixed',
  paddingTop: `56px`,
  top: 0,
  left: 0,
  backgroundColor: theme.palette.background.paper,
  ...(open && {
    ...openedMixin(theme, -24),
  }),
  ...(!open && {
    ...closedMixin(theme),
  }),
}))

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

const DrawerNavigation: FC<PropsWithChildren & {}> = ({ children }) => {
  const theme = useTheme()

  const [open, setOpen] = useState(false)
  const toggleDrawerOpen = () => {
    setOpen((state) => !state)
  }

  const navigate = useNavigate()

  const handleNavigation = (href: string) => (evt: any) => {
    evt.preventDefault()
    navigate(href)
  }

  return (
    <>
      <aside>
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <DrawerButton onClick={toggleDrawerOpen}>
              {theme.direction === 'rtl' ? (
                open ? (
                  <ChevronRight />
                ) : (
                  <ChevronLeft />
                )
              ) : open ? (
                <ChevronLeft />
              ) : (
                <ChevronRight />
              )}
            </DrawerButton>
          </DrawerHeader>
          <DrawerBody open={open}>
            <Navigation
              sx={{
                style: {
                  marginTop: '28px',
                },
              }}
            >
              <NavigationList open={open}>
                <ListItem disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={handleNavigation('/')}
                    sx={{
                      minHeight: 48,
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
                      minHeight: 48,
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
                      <LibraryBooks />
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
          </DrawerBody>
        </Drawer>
      </aside>
      {children}
    </>
  )
}

export default DrawerNavigation
