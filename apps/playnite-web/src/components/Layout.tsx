import { Box, useMediaQuery, useTheme } from '@mui/material'
import { FC, PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { getDeviceFeatures } from '../api/client/state/deviceFeaturesSlice'
import DrawerNavigation from './Navigation/DrawerNavigation'
import MobileDrawerNavigation from './Navigation/MobileDrawerNavigation'
import useThemeWidth from './useThemeWidth'

const Layout: FC<PropsWithChildren & {}> = ({ children }) => {
  const deviceFeatures = useSelector(getDeviceFeatures)

  const theme = useTheme()
  const shouldUseMobileDrawer = useMediaQuery(theme.breakpoints.down('lg'))
  const Drawer = shouldUseMobileDrawer
    ? MobileDrawerNavigation
    : DrawerNavigation

  const width = useThemeWidth()

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer>
        <Box
          component={'main'}
          sx={(theme) => ({
            flexGrow: 1,
            margin: '0 auto',
            maxWidth: `${width}px`,
            [theme.breakpoints.up('xs')]: {
              padding: '80px 24px',
            },
            [theme.breakpoints.up('sm')]: {
              padding: '80px 24px',
            },
            [theme.breakpoints.up('md')]: {
              padding: '80px 24px',
            },
            [theme.breakpoints.up('lg')]: {
              padding: '80px 24px',
            },
            [theme.breakpoints.up('xl')]: {
              padding: '120px 48px',
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
