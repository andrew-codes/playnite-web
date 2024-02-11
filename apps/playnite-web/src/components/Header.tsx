import { Clear, FilterList } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  styled,
} from '@mui/material'
import {
  ChangeEvent,
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFeatureFilterValues,
  getFilterValues,
  setFilter,
  setNameFilter,
} from '../api/client/state/librarySlice'
import AutoComplete from './AutoComplete'

const HeaderContainer = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}))

const Filters = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  height: '56px',
  justifyContent: 'flex-end',
  width: '100%',
}))

const Header: FC<PropsWithChildren<{ showFilters?: boolean }>> = ({
  children,
  showFilters,
  ...rest
}) => {
  const dispatch = useDispatch()
  const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setNameFilter(event.target.value))
  }, [])
  const handleClear = useCallback(() => {
    dispatch(setNameFilter(''))
  }, [])
  const { nameFilter } = useSelector(getFilterValues)

  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const handleShowFilters = useCallback(() => {
    setFilterDialogOpen(true)
  }, [])
  const handleHideFilters = useCallback(() => {
    setFilterDialogOpen(false)
  }, [])

  const features = useSelector(getFeatureFilterValues)
  const selectedFilterTypeValues = features

  const [filterTypeName, setFilterTypeName] = useState('feature')
  const filterValues = useSelector(getFilterValues)
  const selectedFilterValues = filterValues[`${filterTypeName}Filter`]
  const values = useMemo(
    () =>
      selectedFilterValues.map((selectedFilter) =>
        selectedFilterTypeValues.find((v) => v.id === selectedFilter.id),
      ),
    [selectedFilterValues, selectedFilterTypeValues],
  )

  return (
    <>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          paddingTop: theme.spacing(4),
          top: 0,
          zIndex: 1000,
          backgroundColor: theme.palette.background.default,
          [theme.breakpoints.up('lg')]: {
            position: 'sticky',
          },
        })}
      >
        <HeaderContainer {...rest}>
          {children}
          {showFilters && (
            <Box
              sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                width: '100%',
                marginLeft: theme.spacing(2),
                [theme.breakpoints.up('lg')]: {
                  marginLeft: theme.spacing(10),
                },
                [theme.breakpoints.down('lg')]: {
                  marginTop: theme.spacing(2),
                },
              })}
            >
              <Filters>
                <TextField
                  InputProps={{
                    endAdornment: nameFilter !== '' && (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClear}>
                          <Clear />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onChange={handleSearch}
                  label="Find"
                  sx={{ width: '100%' }}
                  type="text"
                  value={nameFilter}
                  variant="outlined"
                />
                <Box>
                  <IconButton
                    onClick={handleShowFilters}
                    size="large"
                    title="show more filters"
                  >
                    <FilterList />
                  </IconButton>
                </Box>
              </Filters>
              {values.length > 0 && (
                <Stack
                  direction="row"
                  sx={(theme) => ({
                    '> div': {
                      margin: theme.spacing(1),
                    },
                  })}
                >
                  {values.map((v) => (
                    <Chip label={v.name} />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </HeaderContainer>
        <Divider sx={(theme) => ({ margin: `${theme.spacing(4)} 0` })} />
      </Box>
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={handleHideFilters}
        open={filterDialogOpen}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const filterValues = JSON.parse(
              formData.get('filter') as string,
            ).map((v) => v.id)
            dispatch(setFilter({ filterTypeName, values: filterValues }))
            handleHideFilters()
          },
        }}
      >
        <DialogTitle>Search Options</DialogTitle>
        <DialogContent>
          <AutoComplete
            label="Features"
            name="filter"
            options={features}
            value={filterValues.featureFilter}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHideFilters}>Cancel</Button>
          <Button type="submit">Search</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Header
