import { Clear } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  TextField,
  styled,
} from '@mui/material'
import _ from 'lodash'
import { FC, ReactNode, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  activateFilters,
  clearedFilters,
  getAllPossibleFilters,
  getFilterValues,
  getSelectedFilter,
  setFilter,
  setSelectedFilter,
} from '../../api/client/state/librarySlice'
import AutoComplete, { AutoCompleteItem } from '../AutoComplete'
import Select from '../Select'
import { HeightBoundListAutoCompleteOptions } from './ListAutoCompleteOptions'

const { startCase } = _

const Form = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  width: '100%',
  '& > *': {
    marginBottom: `${theme.spacing(2)} !important`,

    '&:last-child': {
      marginBottom: '0 !important',
    },
  },
}))

const FilterForm: FC<{
  onCancel?: React.MouseEventHandler<HTMLButtonElement> | undefined
  onSubmit?: React.FormEventHandler<HTMLFormElement> | undefined
}> = ({ onCancel, onSubmit }) => {
  const dispatch = useDispatch()

  const formRef = useRef<HTMLFormElement>(null)
  const nameFilterRef = useRef<HTMLDivElement>(null)
  const nameFilterInputValue = useRef<string>('')
  const handleNameFilterChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      nameFilterInputValue.current = evt.target.value
      dispatch(setFilter({ filterTypeName: 'name', values: evt.target.value }))
    },
    [],
  )
  const handleNameFilterClear = useCallback(() => {
    const inputEl = nameFilterRef.current?.querySelector('input')
    if (inputEl) {
      inputEl.value = ''
      nameFilterInputValue.current = ''
      dispatch(setFilter({ filterTypeName: 'name', values: '' }))
    }
  }, [])

  const handleFiltersSubmit = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
      dispatch(activateFilters())
      onSubmit?.(evt)
    },
    [onSubmit],
  )

  const filterBy = useSelector(getSelectedFilter) ?? 'feature'
  const filterByDisplay = startCase(filterBy)
  const allPossibleFilters = useSelector(getAllPossibleFilters)
  const handleFilterChange =
    (filterName) => (value: { id: string; name: string }[]) => {
      dispatch(
        setFilter({
          filterTypeName: filterName,
          values: value.map(({ id }) => id),
        }),
      )
    }

  const filterValues = useSelector(getFilterValues)

  const handleResetFilters = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      evt.currentTarget.reset()
      dispatch(clearedFilters())
    },
    [],
  )
  const handleFilterByChange = useCallback(
    (evt: SelectChangeEvent<unknown>, child: ReactNode) => {
      dispatch(setSelectedFilter(evt.target.value as string | null))
    },
    [],
  )

  return (
    <Form
      ref={formRef}
      onSubmit={handleFiltersSubmit}
      onReset={handleResetFilters}
    >
      <TextField
        ref={nameFilterRef}
        InputProps={{
          endAdornment: nameFilterInputValue.current !== '' && (
            <InputAdornment position="end">
              <IconButton onClick={handleNameFilterClear}>
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        label="Find"
        onChange={handleNameFilterChange}
        sx={{ width: '100%' }}
        type="text"
        variant="outlined"
      />
      <Box>
        {filterValues.platformFilter
          .concat(filterValues.featureFilter)
          .map((filter) => (
            <Chip key={`${filter?.id}`} label={filter?.name} />
          ))}
      </Box>
      <Divider />
      <FormControl fullWidth>
        <InputLabel id="filterByLabel">Filter By</InputLabel>
        <Select
          labelId="filterByLabel"
          label="Filter By"
          value={filterBy}
          onChange={handleFilterByChange}
        >
          <MenuItem value="platform">Platform</MenuItem>
          <MenuItem value="feature">Feature</MenuItem>
        </Select>
      </FormControl>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          width: '100%',
        })}
      >
        <AutoComplete
          label={filterByDisplay}
          name="platform"
          onChange={handleFilterChange(filterBy)}
          options={(allPossibleFilters[filterBy] ?? []) as AutoCompleteItem[]}
          renderOptions={HeightBoundListAutoCompleteOptions}
        />
      </Box>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        })}
      >
        <Button type="submit">Filter</Button>
        <Button type="reset">Clear</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Box>
    </Form>
  )
}

export default FilterForm
