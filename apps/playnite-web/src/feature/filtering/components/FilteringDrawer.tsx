'use client'

import { usePathname } from 'next/navigation'
import { FC, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { $filterValues } from '../../../api/client/state/librarySlice'
import RightDrawer from '../../shared/components/RightDrawer'
import { useNavigationRouter } from '../../shared/hooks/useNavigationRouter'
import { buildLibraryUrlWithFilters } from './filterUrl'
import Filtering from './Filtering'

const FilteringDrawer: FC<{ disableTransition?: boolean }> = ({
  disableTransition,
}) => {
  const router = useNavigationRouter()
  const pathname = usePathname()
  const activeFilters = useSelector($filterValues)

  const handleClose = useCallback(() => {
    const libraryPath = pathname.replace(/\/filters$/, '')
    router.push(buildLibraryUrlWithFilters(libraryPath, activeFilters))
  }, [router, pathname, activeFilters])

  return (
    <RightDrawer disableTransition={disableTransition} onClose={handleClose}>
      <Filtering />
    </RightDrawer>
  )
}

export default FilteringDrawer
