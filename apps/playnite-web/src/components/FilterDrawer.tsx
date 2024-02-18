import { Clear } from '@mui/icons-material'
import {
  CSSObject,
  Drawer as MuiDrawer,
  Theme,
  Typography,
  styled,
} from '@mui/material'
import { FC, FormEvent, MouseEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  activateFilters,
  getFilterValues,
} from '../api/client/state/librarySlice'
import FilterForm from './Filters/FilterForm'
import IconButton from './IconButton'

const openedMixin = (theme: Theme): CSSObject => ({
  width: `80%`,
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
  overflowY: 'hidden',
  paddingTop: `56px`,
  padding: `${theme.spacing(2.5)}`,
  backgroundColor: theme.palette.background.paper,

  '> *': {
    marginBottom: `${theme.spacing(2)} !important`,

    '&:last-child': {
      marginBottom: '0 !important',
    },
  },
}))

const FilterDrawer: FC<{
  onClose: (
    evt: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement> | {},
  ) => void
  open: boolean
}> = ({ onClose, open }) => {
  const handleClose = useCallback(
    (evt) => {
      onClose(evt)
    },
    [onClose],
  )

  const handleFilterCancel = useCallback(
    (evt) => {
      onClose(evt)
    },
    [onClose],
  )
  const dispatch = useDispatch()
  const handleFilterSubmit = useCallback(
    (evt: FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const name = (formData.get('nameFilter') as string) ?? null
      const feature = (formData.getAll('featureFilter') as string[]) ?? []
      const platform = (formData.getAll('platformFilter') as string[]) ?? []

      dispatch(
        activateFilters({ name: name === '' ? null : name, feature, platform }),
      )
      onClose(evt)
    },
    [onClose],
  )

  const activeFilters = useSelector(getFilterValues)

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      onClose={handleClose}
      // ModalProps={{ keepMounted: true }}
    >
      <DrawerHeader open={open}>
        <IconButton
          onClick={handleFilterCancel}
          name="close-drawer"
          aria-label="close drawer"
        >
          <Clear />
        </IconButton>
      </DrawerHeader>
      <DrawerBody open={open}>
        <Typography variant="h4">Filters</Typography>
        <FilterForm
          onCancel={handleFilterCancel}
          onSubmit={handleFilterSubmit}
          {...activeFilters}
        />
      </DrawerBody>
    </Drawer>
  )
}

export default FilterDrawer
