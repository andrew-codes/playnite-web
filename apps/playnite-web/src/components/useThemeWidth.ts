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
    if (isXl) {
      return theme.breakpoints.values.xl - 81 - 16
    }
    if (isLg) {
      return theme.breakpoints.values.lg - 81 - 16
    }
    if (isMd) {
      return theme.breakpoints.values.md - 16 - 40 - 24
    }
    if (isSm) {
      theme.breakpoints.values.sm - 24 - 20
    }
    if (isXs) {
      return theme.breakpoints.values.xs - 24 - 20
    }
    return 342
  }, [isXl, isLg, isMd, isSm, isXs])

  return width
}

export default useThemeWidth
