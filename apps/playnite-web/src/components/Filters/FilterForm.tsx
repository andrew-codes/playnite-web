import { Clear } from '@mui/icons-material'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from '@mui/material'
import { FC, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { getFeatureFilterValues } from '../../api/client/state/librarySlice'
import AutoComplete from '../AutoComplete'
import ListAutoCompleteOptions from './ListAutoCompleteOptions'

const FilterForm: FC<{
  onCancel?: React.MouseEventHandler<HTMLButtonElement> | undefined
  onSubmit?: React.FormEventHandler<HTMLFormElement> | undefined
}> = ({ onCancel, onSubmit }) => {
  const handleFiltersSubmit = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
      onSubmit?.(evt)
    },
    [onSubmit],
  )
  const formRef = useRef<HTMLFormElement>(null)
  const nameFilterRef = useRef<HTMLDivElement>(null)
  const nameFilterInputValue = useRef<string>('')
  const handleNameFilterChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      nameFilterInputValue.current = evt.target.value
    },
    [nameFilterInputValue.current],
  )
  const handleNameFilterClear = useCallback(() => {
    const inputEl = nameFilterRef.current?.querySelector('input')
    if (inputEl) {
      inputEl.value = ''
    }
  }, [nameFilterRef.current])
  const handleResetFilters = useCallback(
    (evt: React.FormEvent<HTMLFormElement>) => {
      formRef.current?.reset()
    },
    [],
  )

  const features = useSelector(getFeatureFilterValues)

  return (
    <form
      ref={formRef}
      onSubmit={handleFiltersSubmit}
      onReset={handleResetFilters}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
        })}
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
      </Box>
      <AutoComplete
        label="Features"
        name="filter"
        options={features}
        renderOptions={ListAutoCompleteOptions}
      />

      <Button type="submit">Filter</Button>
      <Button type="reset">Clear</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </form>
  )
}

export default FilterForm
