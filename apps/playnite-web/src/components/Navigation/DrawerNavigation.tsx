import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import {
  CSSObject,
  IconButton,
  Drawer as MuiDrawer,
  Theme,
  styled,
  useTheme,
} from '@mui/material'
import { FC, PropsWithChildren, useState } from 'react'
import MainNavigation from './MainNavigation'

const drawerWidth = 320
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

const DrawerNavigation: FC<PropsWithChildren & {}> = ({ children }) => {
  const theme = useTheme()

  const [open, setOpen] = useState(false)
  const toggleDrawerOpen = () => {
    setOpen((state) => !state)
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
            <MainNavigation open={open} />
          </DrawerBody>
        </Drawer>
      </aside>
      {children}
    </>
  )
}

export default DrawerNavigation
