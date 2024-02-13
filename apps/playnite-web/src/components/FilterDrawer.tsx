import { Clear } from '@mui/icons-material'
import {
  CSSObject,
  Drawer as MuiDrawer,
  Theme,
  Typography,
  styled,
} from '@mui/material'
import React, { FC } from 'react'
import FilterForm from './Filters/FilterForm'
import IconButton from './IconButton'

const openedMixin = (theme: Theme): CSSObject => ({
  width: `85%`,
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
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: 0,
  zIndex: 1500,
  ...theme.mixins.toolbar,
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
  padding: `${theme.spacing(2)}`,
  backgroundColor: theme.palette.background.paper,
}))

const FilterDrawer: FC<{
  onClose: React.MouseEventHandler<HTMLButtonElement>
  open: boolean
}> = ({ onClose, open }) => {
  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
    >
      <DrawerHeader open={open}>
        <IconButton
          onClick={onClose}
          name="close-drawer"
          aria-label="close drawer"
        >
          <Clear />
        </IconButton>
      </DrawerHeader>
      <DrawerBody open={open}>
        <Typography variant="h4">Filter</Typography>
        <FilterForm onCancel={onClose} />
      </DrawerBody>
    </Drawer>
  )
}

export default FilterDrawer
