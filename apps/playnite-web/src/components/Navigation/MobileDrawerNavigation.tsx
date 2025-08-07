import { ChevronLeft, ChevronRight, Clear } from '@mui/icons-material'
import {
  CSSObject,
  AppBar as MuiAppBar,
  Drawer as MuiDrawer,
  Theme,
  Toolbar,
  styled,
  useTheme,
} from '@mui/material'
import {
  ComponentType,
  FC,
  PropsWithChildren,
  ReactNode,
  useState,
} from 'react'
import IconButton from '../IconButton'
import MainNavigation from './MainNavigation'
import { NavigationContainer } from './NavigationContainer'

const drawerWidth = 296
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

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open?: boolean }>(({ theme, open }) => ({
  backgroundImage: 'none',
  ...(open && {
    // position: 'unset',
    width: `calc(100% + 15px)`,
    '& .MuiToolbar-root': {
      marginLeft: `${drawerWidth - 24 - 24 - 2}px`,
      [theme.breakpoints.down('sm')]: {
        marginLeft: `${drawerWidth - 16 - 16 - 2}px`,
      },
      zIndex: 1800,
      transition: theme.transitions.create(['margin'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }),
  ...(!open && {
    '& .MuiToolbar-root': {
      transition: theme.transitions.create(['margin'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
  }),
}))

const AppBarHeader = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: 0,
  zIndex: 1500,
  ...theme.mixins.toolbar,
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => true,
})(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    '& .MuiDrawer-paper': {
      overflowY: 'unset',
      border: 'none',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '1px',
        zIndex: 1300,
        backgroundColor: theme.palette.divider,
      },
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      ...closedMixin(theme, 24),
      overflowX: 'unset',
      transform: 'translateX(-48px) !important',
      background: 'none',
      boxShadow: 'none',
      overflowY: 'unset',
      border: 'none',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '1px',
        zIndex: 1300,
        display: 'none',
        backgroundColor: theme.palette.divider,
      },
    },
  }),
}))

const DrawerHeader = styled(AppBarHeader, {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  position: 'absolute',
  right: '-22px',
  ...(!open && {
    display: 'none',
  }),
}))

const DrawerBody = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  position: 'relative',
  flexDirection: 'column',
  paddingTop: `56px`,
  backgroundColor: theme.palette.background.paper,
  ...(open && {
    ...openedMixin(theme),
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'unset',
  }),
  ...(!open && {
    width: '80px',
    overflowX: 'unset',
    transition: theme.transitions.create(['width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  }),
}))

const Navigation = styled(MainNavigation)<{ open: boolean }>(
  ({ open, theme }) => ({
    ...(!open ? { display: 'none !important' } : {}),
  }),
)

const MobileDrawerNavigation: FC<
  PropsWithChildren<{
    title?: ReactNode
    navs: Array<ComponentType<{ open: boolean }>>
  }>
> = ({ children, title, navs = [] }) => {
  const [open, setOpen] = useState(false)
  const toggleDrawerOpen = () => {
    setOpen((state) => !state)
  }

  const theme = useTheme()

  return (
    <>
      <AppBar position="sticky" open={open}>
        <Toolbar>
          <AppBarHeader open={open}>
            <IconButton
              onClick={toggleDrawerOpen}
              name="toggle-drawer"
              aria-label="open drawer"
            >
              {theme.direction === 'rtl' ? (
                open ? (
                  <Clear />
                ) : (
                  <ChevronLeft />
                )
              ) : open ? (
                <Clear />
              ) : (
                <ChevronRight />
              )}
            </IconButton>
          </AppBarHeader>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={open}
        onClose={toggleDrawerOpen}
        ModalProps={{ keepMounted: true }}
      >
        <DrawerHeader open={open}>
          <IconButton
            onClick={toggleDrawerOpen}
            name="toggle-drawer"
            aria-label="open drawer"
          >
            {theme.direction === 'rtl' ? (
              open ? (
                <Clear />
              ) : (
                <ChevronLeft />
              )
            ) : open ? (
              <Clear />
            ) : (
              <ChevronRight />
            )}
          </IconButton>
        </DrawerHeader>
        <DrawerBody open={open}>
          <NavigationContainer open={open} navs={navs} />
        </DrawerBody>
      </Drawer>
      {children}
    </>
  )
}

export default MobileDrawerNavigation
