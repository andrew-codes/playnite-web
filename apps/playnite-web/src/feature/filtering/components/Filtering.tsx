'use client'

import { Typography } from '@mui/material'
import { usePathname } from 'next/navigation'
import { FC, FormEvent, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  $filterValues,
  activateFilters,
} from '../../../api/client/state/librarySlice'
import { useNavigationRouter } from '../../shared/hooks/useNavigationRouter'
import FilterForm from './FilterForm'
import { buildLibraryUrlWithFilters } from './filterUrl'

const Filtering: FC<{}> = () => {
  const router = useNavigationRouter()
  const pathname = usePathname()
  const activeFilters = useSelector($filterValues)

  const handleFilterCancel = useCallback(
    (evt) => {
      const libraryPath = pathname.replace(/\/filters$/, '')
      router.push(buildLibraryUrlWithFilters(libraryPath, activeFilters))
    },
    [router, pathname, activeFilters],
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

      // Build the library URL (strip /filters suffix) with filter state as query params
      const libraryPath = pathname.replace(/\/filters$/, '')
      router.push(
        buildLibraryUrlWithFilters(libraryPath, {
          nameFilter: name,
          filterItems: filters,
        }),
      )
    },
    [router, pathname, dispatch],
  )

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
