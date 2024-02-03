import { useMediaQuery, useTheme } from '@mui/material'
import { useMemo } from 'react'

const useThemeWidth = () => {
  const theme = useTheme()

  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))

  const width = useMemo(() => {
    if (isXl) return 1280
    if (isLg) return 938
    if (isMd) return 736
    if (isSm) return 398
    if (isXs) return 374
    return 342
  }, [isXl, isLg, isMd, isSm, isXs])

  return width
}

export default useThemeWidth
