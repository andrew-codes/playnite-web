'use client'

import { Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FC, FormEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  $filterValues,
  activateFilters,
} from '../../../api/client/state/librarySlice'
import FilterForm from './FilterForm'

const Filtering: FC<{}> = () => {
  const router = useRouter()
  const handleFilterCancel = useCallback(
    (evt) => {
      router.back()
    },
    [router],
  )
  const dispatch = useDispatch()
  const handleFilterSubmit = useCallback(
    (evt: FormEvent<HTMLFormElement>) => {
      evt.preventDefault()
      const formData = new FormData(evt.currentTarget)
      const name = ((formData.get('nameFilter') as string) ?? '').trim()
      const filters = Array.from(formData.keys())
        .filter((key) => key !== 'nameFilter' && !key.includes('RelatedType'))
        .map((key) => {
          return {
            field: key,
            value: formData.getAll(key) as string[],
            relatedType: formData.get(`${key}RelatedType`) as string,
          }
        })

      dispatch(
        activateFilters({
          name: name === '' ? undefined : name,
          filterItems: filters,
        }),
      )

      router.back()
    },
    [router, dispatch],
  )

  const activeFilters = useSelector($filterValues)

  return (
    <>
      <Typography variant="h4">Filters</Typography>
      <FilterForm
        onCancel={handleFilterCancel}
        onSubmit={handleFilterSubmit}
        nameFilter={activeFilters.nameFilter}
        filterItems={activeFilters.filterItems}
      />
    </>
  )
}

export default Filtering
