import { Box, useMediaQuery, useTheme } from '@mui/material'
import { FC, PropsWithChildren } from 'react'
import DrawerNavigation from './Navigation/DrawerNavigation'
import MobileDrawerNavigation from './Navigation/MobileDrawerNavigation'
import useThemeWidth from './useThemeWidth'

const Layout: FC<PropsWithChildren & {}> = ({ children }) => {
  const theme = useTheme()
  const shouldUseMobileDrawer = useMediaQuery(theme.breakpoints.down('lg'))
  const Drawer = shouldUseMobileDrawer
    ? MobileDrawerNavigation
    : DrawerNavigation

  const width = useThemeWidth()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Drawer>
        <Box
          component={'main'}
          sx={(theme) => ({
            flexGrow: 1,
            margin: '0 auto',
            maxWidth: `${width}px`,
            [theme.breakpoints.up('xs')]: {
              padding: '64px 24px',
            },
            [theme.breakpoints.up('sm')]: {
              padding: '64px 24px',
            },
            [theme.breakpoints.up('md')]: {
              padding: '64px 64px',
            },
            [theme.breakpoints.up('lg')]: {
              padding: '80px 64px',
            },
            [theme.breakpoints.up('xl')]: {
              padding: '80px 48px',
            },
            [theme.breakpoints.down('xs')]: {
              padding: '80px 24px',
            },
          })}
        >
          {children}
        </Box>
      </Drawer>
    </Box>
  )
}

export default Layout
