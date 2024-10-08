import { Clear } from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
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
import {
  FC,
  Fragment,
  ReactNode,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { useFilterItems } from '../../queryHooks/getFilterItems'
import AutoComplete from '../AutoComplete'
import SquareIconButton from '../IconButton'
import Select from '../Select'
import ListAutoCompleteOptions from './ListAutoCompleteOptions'

const { keyBy, merge, uniqBy } = _

type GraphQuery = {
  filterItems: Array<{
    name: string
    field: string
    allowedValues: Array<{ display: string; value: string }>
  }>
}

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

const CloseIconButton = styled(SquareIconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(3),
  top: theme.spacing(3),
}))

type FilterItemValue = {
  field: string
  value: Array<string>
  relatedType: string
}

const filterFormInitialState: {
  nameFilter: string
  filterItems: Record<string, FilterItemValue>
  filterBy: string | null
} = {
  nameFilter: '',
  filterItems: {},
  filterBy: null,
}
type FilterFormAction =
  | { type: 'selectedFilterBy'; payload: string | null }
  | {
      type: 'setFilterValue'
      payload: {
        relatedType: string
        values: Array<{ display: string; value: string }>
      }
    }
  | { type: 'setNameFilterValue'; payload: string }
  | { type: 'removeFilter'; payload: string }
  | {
      type: 'reset'
      payload: { nameFilter?: string; filterItems?: FilterItemValue[] }
    }
  | { type: 'clear' }
const filterFormReducer = (
  state: typeof filterFormInitialState,
  action: FilterFormAction,
): typeof filterFormInitialState => {
  switch (action.type) {
    case 'selectedFilterBy':
      return merge({}, state, { filterBy: action.payload })
    case 'setFilterValue':
      if (state.filterBy === null) {
        return state
      }
      const newFilterValueState = merge({}, state)
      newFilterValueState.filterItems[state.filterBy] = {
        field: state.filterBy,
        value: action.payload.values.map((value) => value.value),
        relatedType: action.payload.relatedType,
      }

      return newFilterValueState
    case 'setNameFilterValue':
      return {
        ...state,
        ['nameFilter']: action.payload,
      }
    case 'removeFilter':
      const newState = merge({}, state)
      newState.filterItems = Object.fromEntries(
        Object.entries(newState.filterItems).map(([field, filterItem]) => {
          const value = filterItem.value.filter(
            (value) => value !== action.payload,
          )
          return [field, { field, value, relatedType: filterItem.relatedType }]
        }),
      )
      return newState
    case 'reset':
      return {
        filterBy: null,
        nameFilter: action.payload.nameFilter ?? '',
        filterItems: keyBy(action.payload.filterItems ?? [], 'field'),
      }
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
  filterItems?: Array<{
    field: string
    value: Array<string>
    relatedType: string
  }>
}> = ({ filterItems, nameFilter, onCancel, onSubmit }) => {
  const [state, dispatch] = useReducer(filterFormReducer, {
    filterBy: null,
    nameFilter: nameFilter ?? '',
    filterItems: keyBy(filterItems ?? [], 'field'),
  })

  const [filterByOpen, setFilterByOpen] = useState(false)
  const handleCloseFilterValues = useCallback(() => {
    dispatch({ type: 'selectedFilterBy', payload: null })
    setFilterByOpen(false)
  }, [])
  const handleFilterByChange = useCallback(
    (evt: SelectChangeEvent<unknown>, child: ReactNode) => {
      dispatch({
        type: 'selectedFilterBy',
        payload: evt.target.value as string | null,
      })
      setFilterByOpen(true)
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

  const handleRemoveFilter = (value: string) => {
    dispatch({ type: 'removeFilter', payload: value })
  }

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
        payload: { nameFilter, filterItems },
      })
      onCancel?.(evt)
    },
    [onCancel],
  )

  const { data, loading, error } = useFilterItems()
  if (error) {
    console.error(error)
  }
  const handleFilterChange = useCallback(
    (values) => {
      dispatch({
        type: 'setFilterValue',
        payload: {
          relatedType:
            data?.filterItems.find((fi) => fi.field === state.filterBy)
              ?.relatedType ?? '',
          values,
        },
      })
    },
    [data?.filterItems, state.filterBy],
  )

  const possibleFilterItems = data?.filterItems ?? []
  const allPossibleFilterValues = useMemo(() => {
    return (
      possibleFilterItems.find(
        (filterItem) => filterItem.field === state.filterBy,
      )?.allowedValues ?? []
    )
  }, [possibleFilterItems, state.filterBy])
  const allFilterItemValues = useMemo(() => {
    return Object.values(state.filterItems)
      .flatMap((filterItem) =>
        filterItem.value.map((value) => ({
          field: filterItem.field,
          value,
          relatedType: filterItem.relatedType,
        })),
      )
      .map((filterItemValue) =>
        merge({}, filterItemValue, {
          display:
            possibleFilterItems
              .find((filterItem) => filterItem.field === filterItemValue.field)
              ?.allowedValues.find(
                (allowedValue) => allowedValue.value === filterItemValue.value,
              )?.display ?? filterItemValue.value,
        }),
      )
  }, [state.filterItems, possibleFilterItems])

  const allFilterItemRelatedTypes = useMemo(() => {
    return uniqBy(
      allFilterItemValues.map((filterItem) => ({
        field: filterItem.field,
        relatedType: filterItem.relatedType,
      })),
      'field',
    )
  }, [allFilterItemValues])

  const currentFilterItemValues = useMemo(() => {
    return allFilterItemValues.filter(
      (filterItem) => filterItem.field === state.filterBy,
    )
  }, [allFilterItemValues, state.filterBy])

  const currentFilterByName = possibleFilterItems.find(
    (filterItem) => filterItem.field === state.filterBy,
  )?.name

  return (
    <Form
      data-test="FilterForm"
      onSubmit={onSubmit}
      onReset={handleResetFilters}
    >
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
      <Divider />
      <FormControl fullWidth>
        <InputLabel id="filterByLabel">Filter By</InputLabel>
        <Select
          labelId="filterByLabel"
          label="Filter By"
          value={state.filterBy}
          onChange={handleFilterByChange}
        >
          {possibleFilterItems.map((filterItem) => (
            <MenuItem value={filterItem.field}>{filterItem.name}</MenuItem>
          ))}
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
        <Dialog
          open={filterByOpen}
          onClose={handleCloseFilterValues}
          PaperProps={{
            sx: (theme) => ({
              width: '100%',
              maxWidth: '100%',
              maxHeight: '100%',
              height: `calc(100% - ${theme.spacing(6)})`,
              padding: '24px',

              '.MuiDialogContent-root': {
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              },
            }),
          }}
        >
          <DialogTitle>
            <span>Filter by {currentFilterByName}</span>
          </DialogTitle>
          <CloseIconButton onClick={handleCloseFilterValues}>
            <Clear />
          </CloseIconButton>
          <DialogContent>
            <AutoComplete
              label={currentFilterByName}
              onChange={handleFilterChange}
              options={allPossibleFilterValues}
              renderOptions={ListAutoCompleteOptions}
              value={currentFilterItemValues}
            />
          </DialogContent>
        </Dialog>
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {allFilterItemValues.map((filterItem) => {
            return (
              <Fragment key={filterItem.value}>
                <Chip
                  label={filterItem.display}
                  onDelete={() => handleRemoveFilter(filterItem.value)}
                  sx={(theme) => ({ margin: theme.spacing(0.25) })}
                />
                <input
                  type="hidden"
                  name={filterItem.field}
                  value={filterItem.value}
                />
              </Fragment>
            )
          })}
          {allFilterItemRelatedTypes.map((filterItem) => {
            return (
              <input
                type="hidden"
                name={`${filterItem.field}RelatedType`}
                value={filterItem.relatedType}
              />
            )
          })}
        </Box>
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
