import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { FC, useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getFeatureFilterValues,
  getFilterValues,
  setFilter,
} from '../../api/client/state/librarySlice'
import AutoComplete from '../AutoComplete'
import ListAutoCompleteOptions from './ListAutoCompleteOptions'

const Filters: FC<{
  open: boolean
  onClose?:
    | ((event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'other') => void)
    | undefined
}> = ({ onClose, open }) => {
  const dispatch = useDispatch()

  const handleCancelClick = useCallback((evt) => {
    onClose?.(evt, 'other')
  }, [])

  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const handleShowFilter = useCallback(() => {
    setFilterDialogOpen(true)
  }, [])
  const handleHideFilter = useCallback(() => {
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
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={onClose}
        open={open}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const filterValues = JSON.parse(
              formData.get('filter') as string,
            ).map((v) => v.id)
            dispatch(setFilter({ filterTypeName, values: filterValues }))
            onClose?.({}, 'other')
          },
        }}
      >
        <DialogTitle>Search Options</DialogTitle>
        <DialogContent>Hello</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClick}>Cancel</Button>
          <Button type="submit">Search</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={handleHideFilter}
        open={filterDialogOpen}
        PaperProps={{
          component: 'form',
          sx: (theme) => ({ height: `calc(100% - ${theme.spacing(4)})` }),
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            const filterValues = JSON.parse(
              formData.get('filter') as string,
            ).map((v) => v.id)
            handleHideFilter()
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
            renderOptions={ListAutoCompleteOptions}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHideFilter}>Cancel</Button>
          <Button type="submit">Filter</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Filters
