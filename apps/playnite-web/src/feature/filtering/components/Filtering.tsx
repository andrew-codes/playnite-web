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
import { ActiveFilters, buildLibraryUrlWithFilters } from './filterUrl'

const Filtering: FC<{
  onFilter?: (filters: ActiveFilters) => void
  onCancel?: () => void
}> = ({ onFilter, onCancel }) => {
  const router = useNavigationRouter()
  const pathname = usePathname()
  const activeFilters = useSelector($filterValues)

  const handleFilterCancel = useCallback(
    (evt) => {
      if (onCancel) {
        onCancel()
      } else {
        const libraryPath = pathname.replace(/\/filters$/, '')
        router.push(buildLibraryUrlWithFilters(libraryPath, activeFilters))
      }
    },
    [onCancel, router, pathname, activeFilters],
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

      const newFilters: ActiveFilters = {
        nameFilter: name,
        filterItems: filters,
      }

      if (onFilter) {
        onFilter(newFilters)
      } else {
        // Fallback: when used outside FilteringDrawer (e.g., EmbeddableLibrary),
        // navigate directly using the current Next.js pathname.
        const libraryPath = pathname.replace(/\/filters$/, '')
        router.push(buildLibraryUrlWithFilters(libraryPath, newFilters))
      }
    },
    [router, pathname, dispatch, onFilter],
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
