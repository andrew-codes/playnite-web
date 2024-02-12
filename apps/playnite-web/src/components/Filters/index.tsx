import { Clear, FilterList } from '@mui/icons-material'
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from '@mui/material'
import { ChangeEvent, FC, useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFeatureFilterValues,
  getFilterValues,
  setNameFilter,
} from '../../api/client/state/librarySlice'
import MoreFilters from './MoreFilters'

const Filters: FC<{}> = ({}) => {
  const dispatch = useDispatch()
  const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setNameFilter(event.target.value))
  }, [])
  const handleClear = useCallback(() => {
    dispatch(setNameFilter(''))
  }, [])
  const { nameFilter } = useSelector(getFilterValues)

  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false)
  const handleShowFilters = useCallback(() => {
    setFiltersDialogOpen(true)
  }, [])
  const handleHideFilters = useCallback(() => {
    setFiltersDialogOpen(false)
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
        <Box
          sx={(theme) => ({
            alignItems: 'center',
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            height: '56px',
            justifyContent: 'flex-end',
            width: '100%',
          })}
        >
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
        </Box>
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
      <MoreFilters open={filtersDialogOpen} onClose={handleHideFilters} />
    </>
  )
}

export default Filters
