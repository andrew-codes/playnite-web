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
import { FC, Fragment, ReactNode, useCallback, useReducer } from 'react'
import { useSelector } from 'react-redux'
import { getAllPossibleFilterValues } from '../../api/client/state/librarySlice'
import AutoComplete, { AutoCompleteItem } from '../AutoComplete'
import Select from '../Select'
import { HeightBoundListAutoCompleteOptions } from './ListAutoCompleteOptions'

const { merge, startCase } = _

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

const filterFormInitialState: {
  nameFilter: string
  platformFilter: AutoCompleteItem[]
  featureFilter: AutoCompleteItem[]
  filterBy: string
} = {
  nameFilter: '',
  platformFilter: [],
  featureFilter: [],
  filterBy: 'feature',
}
const filterFormReducer = (state, action) => {
  switch (action.type) {
    case 'selectedFilterBy':
      return {
        ...state,
        filterBy: action.payload,
      }
    case 'setFilterValue':
      return {
        ...state,
        [`${state.filterBy}Filter`]: action.payload,
      }
    case 'setNameFilterValue':
      return {
        ...state,
        ['nameFilter']: action.payload,
      }
    case 'reset':
      return action.payload
    case 'clear':
      return filterFormInitialState
    default:
      return state
  }
}

const FilterForm: FC<{
  onCancel?: React.MouseEventHandler<HTMLButtonElement> | undefined
  onSubmit?: React.FormEventHandler<HTMLFormElement> | undefined
  nameFilter?: string
  platformFilter?: AutoCompleteItem[]
  featureFilter?: AutoCompleteItem[]
}> = ({ nameFilter, platformFilter, featureFilter, onCancel, onSubmit }) => {
  const [state, dispatch] = useReducer(
    filterFormReducer,
    merge({}, filterFormInitialState, {
      nameFilter: nameFilter ?? '',
      featureFilter: featureFilter,
      platformFilter: platformFilter,
    }),
  )

  const filterByDisplay = startCase(state.filterBy)
  const handleFilterByChange = useCallback(
    (evt: SelectChangeEvent<unknown>, child: ReactNode) => {
      dispatch({
        type: 'selectedFilterBy',
        payload: evt.target.value as string | null,
      })
    },
    [],
  )

  const handleNameFilterChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'setNameFilterValue', payload: evt.target.value })
    },
    [],
  )
  const handleNameFilterClear = useCallback(() => {
    dispatch({ type: 'setNameFilterValue', payload: '' })
  }, [])

  const allPossibleFilters = useSelector(getAllPossibleFilterValues)
  const handleFilterChange = useCallback((values) => {
    dispatch({
      type: 'setFilterValue',
      payload: values,
    })
  }, [])

  const handleResetFilters = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      dispatch({ type: 'clear' })
    },
    [],
  )
  const handleCancel = useCallback(
    (evt: React.MouseEvent<HTMLButtonElement>) => {
      dispatch({
        type: 'reset',
        payload: { nameFilter, platformFilter, featureFilter },
      })
      onCancel?.(evt)
    },
    [onCancel],
  )

  return (
    <Form onSubmit={onSubmit} onReset={handleResetFilters}>
      <TextField
        name="nameFilter"
        InputProps={{
          endAdornment: state.nameFilter !== '' && (
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
        value={state.nameFilter}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {state.platformFilter.map((filter) => (
          <Fragment key={filter.id}>
            <Chip
              label={filter.name}
              sx={(theme) => ({ margin: theme.spacing(0.25) })}
            />
            <input type="hidden" name="platformFilter" value={filter.id} />
          </Fragment>
        ))}
        {state.featureFilter.map((filter) => (
          <Fragment key={filter.id}>
            <Chip
              label={filter.name}
              sx={(theme) => ({ margin: theme.spacing(0.25) })}
            />
            <input type="hidden" name="featureFilter" value={filter.id} />
          </Fragment>
        ))}
      </Box>
      <Divider />
      <FormControl fullWidth>
        <InputLabel id="filterByLabel">Filter By</InputLabel>
        <Select
          labelId="filterByLabel"
          label="Filter By"
          value={state.filterBy}
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
          onChange={handleFilterChange}
          options={
            (allPossibleFilters[state.filterBy] ?? []) as AutoCompleteItem[]
          }
          renderOptions={HeightBoundListAutoCompleteOptions}
          value={(state[`${state.filterBy}Filter`] ?? []) as AutoCompleteItem[]}
        />
      </Box>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          [theme.breakpoints.up('lg')]: {
            justifyContent: 'center',
            '> button': {
              margin: `0 ${theme.spacing(2)}`,
            },
          },
          [theme.breakpoints.down('lg')]: {
            justifyContent: 'space-between',
            '> button': {
              flex: 1,
            },
          },
        })}
      >
        <Button type="submit" size="large">
          Filter
        </Button>
        <Button type="reset" size="large">
          Clear
        </Button>
        <Button onClick={handleCancel} size="large">
          Cancel
        </Button>
      </Box>
    </Form>
  )
}

export default FilterForm
