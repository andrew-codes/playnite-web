'use client'

import { usePathname } from 'next/navigation'
import { FC, useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { $filterValues } from '../../../api/client/state/librarySlice'
import RightDrawer from '../../shared/components/RightDrawer'
import { useNavigationRouter } from '../../shared/hooks/useNavigationRouter'
import { ActiveFilters, buildLibraryUrlWithFilters } from './filterUrl'
import Filtering from './Filtering'

const FilteringDrawer: FC<{ disableTransition?: boolean }> = ({
  disableTransition,
}) => {
  const router = useNavigationRouter()
  const pathname = usePathname()
  const activeFilters = useSelector($filterValues)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (pathname?.endsWith('/filters')) {
      setClosing(false)
    }
  }, [pathname])

  const handleClose = useCallback(() => {
    setClosing(true)
    const libraryPath = pathname.replace(/\/filters$/, '')
    router.push(buildLibraryUrlWithFilters(libraryPath, activeFilters))
  }, [router, pathname, activeFilters])

  const handleFilter = useCallback(
    (filters: ActiveFilters) => {
      setClosing(true)
      const libraryPath = pathname.replace(/\/filters$/, '')
      router.push(buildLibraryUrlWithFilters(libraryPath, filters))
    },
    [router, pathname],
  )

  if (closing || !pathname?.endsWith('/filters')) {
    return null
  }

  return (
    <RightDrawer disableTransition={disableTransition} onClose={handleClose}>
      <Filtering onFilter={handleFilter} onCancel={handleClose} />
    </RightDrawer>
  )
}

export default FilteringDrawer
