import { Typography } from '@mui/material'
import { FC, FormEvent, MouseEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  activateFilters,
  getFilterValues,
} from '../api/client/state/librarySlice'
import FilterForm from './Filters/FilterForm'

const Filters: FC<{
  onClose: (
    evt: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement> | {},
  ) => void
}> = ({ onClose }) => {
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
    <>
      <Typography variant="h4">Filters</Typography>
      <FilterForm
        onCancel={handleFilterCancel}
        onSubmit={handleFilterSubmit}
        {...activeFilters}
      />
    </>
  )
}

export default Filters
