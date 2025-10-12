'use client'

import { Clear } from '@mui/icons-material'
import { CSSObject, Drawer as MuiDrawer, Theme, styled } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react'
import IconButton from './IconButton'

const openedMixin = (theme: Theme): CSSObject => ({
  width: `664px`,
  [theme.breakpoints.down('md')]: {
    width: `100%`,
  },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `0`,
  [theme.breakpoints.up('sm')]: {
    width: `0`,
  },
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
      overflowY: 'unset',
      border: 'none',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
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
      ...closedMixin(theme),
      overflowX: 'unset',
      boxShadow: 'none',
      overflowY: 'unset',
      border: 'none',
      '&:after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '1px',
        zIndex: 1300,
        display: 'none',
        backgroundColor: theme.palette.divider,
      },
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
  ...theme.mixins.toolbar,
  ...(!open && {
    display: 'none',
  }),
  [theme.breakpoints.down('lg')]: {
    top: '0',
  },
}))

const DrawerBody = styled('div', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ open, theme }) => ({
  display: 'flex',
  height: '100%',
  width: '100%',
  position: 'relative',
  flexDirection: 'column',
  overflowY: 'hidden',
  backgroundColor: theme.palette.background.paper,

  '> div': {
    padding: `56px ${theme.spacing(2.5)} ${theme.spacing(2.5)}`,

    '> *': {
      marginBottom: `${theme.spacing(2)} !important`,

      '&:last-child': {
        marginBottom: '0 !important',
      },
    },
  },
}))

const RightDrawer: FC<
  PropsWithChildren<{
    disableTransition?: boolean
  }>
> = ({ children, disableTransition }) => {
  const router = useRouter()
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
      anchor="right"
      open={disableTransition || open}
      onClose={handleClose}
    >
      <DrawerHeader open={open}>
        <IconButton
          onClick={handleClose}
          name="close-drawer"
          aria-label="close drawer"
        >
          <Clear />
        </IconButton>
      </DrawerHeader>
      <DrawerBody open={open}>
        <div>{children}</div>
      </DrawerBody>
    </Drawer>
  )
}

export default RightDrawer
