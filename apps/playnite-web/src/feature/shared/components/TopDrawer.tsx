'use client'

import { Clear } from '@mui/icons-material'
import { CSSObject, Drawer as MuiDrawer, Theme, styled } from '@mui/material'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import { useNavigationRouter } from '../hooks/useNavigationRouter'
import IconButton from './IconButton'

const openedMixin = (theme: Theme): CSSObject => ({
  height: 'auto',
  maxHeight: '80vh',
  transition: theme.transitions.create('height', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowY: 'auto',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('height', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowY: 'hidden',
  height: 0,
})

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => true,
})(({ theme, open }) => ({
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': {
      ...openedMixin(theme),
      border: 'none',
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': {
      ...closedMixin(theme),
      border: 'none',
    },
  }),
}))

const DrawerHeader = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  position: 'absolute',
  right: `24px`,
  top: '13px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: 0,
  zIndex: 1500,
  ...(!open && {
    display: 'none',
  }),
}))

const DrawerBody = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  position: 'relative',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  padding: `${theme.spacing(3)} ${theme.spacing(2.5)} ${theme.spacing(2.5)}`,

  '> div': {
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
  },
}))

const TopDrawer: FC<
  PropsWithChildren<{
    disableTransition?: boolean
  }>
> = ({ children, disableTransition }) => {
  const router = useNavigationRouter()
  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  const [open, setOpen] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [disableTransition])

  return (
    <Drawer
      variant="temporary"
      anchor="top"
      open={disableTransition || open}
      onClose={handleClose}
    >
      <DrawerHeader open={open}>
        <IconButton
          onClick={handleClose}
          name="close-top-drawer"
          aria-label="close now playing"
        >
          <Clear />
        </IconButton>
      </DrawerHeader>
      <DrawerBody>
        <div>{children}</div>
      </DrawerBody>
    </Drawer>
  )
}

export default TopDrawer
