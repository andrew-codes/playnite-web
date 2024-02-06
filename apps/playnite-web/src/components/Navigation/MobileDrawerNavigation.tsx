import { Menu } from '@mui/icons-material'
import { CSSObject, Drawer, IconButton, Theme, styled } from '@mui/material'
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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: 0,
  position: 'absolute',
  left: '16px',
  top: '16px',
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

const MobileDrawerNavigation: FC<PropsWithChildren & {}> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const toggleDrawerOpen = () => {
    setOpen((state) => !state)
  }

  return (
    <>
      <aside>
        <DrawerHeader>
          <DrawerButton onClick={toggleDrawerOpen}>
            <Menu />
          </DrawerButton>
        </DrawerHeader>
        <Drawer variant="temporary" open={open} onClose={toggleDrawerOpen}>
          <DrawerBody open={open}>
            <MainNavigation open={open} />
          </DrawerBody>
        </Drawer>
      </aside>
      {children}
    </>
  )
}

export default MobileDrawerNavigation
