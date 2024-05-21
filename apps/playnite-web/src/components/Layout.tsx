import { Box, useMediaQuery, useTheme } from '@mui/material'
import { FC, PropsWithChildren } from 'react'
import NonMobileDrawerNavigation from './Navigation/NonMobileDrawerNavigation'

const Layout: FC<PropsWithChildren & {}> = ({ children }) => {
  const theme = useTheme()
  const shouldUseNonMobileDrawer = useMediaQuery(theme.breakpoints.up('lg'))

  return shouldUseNonMobileDrawer ? (
    <NonMobileDrawerNavigation>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>{children}</Box>
    </NonMobileDrawerNavigation>
  ) : (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>{children}</Box>
  )
}

export default Layout
