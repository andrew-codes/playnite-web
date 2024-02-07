import { Box, useMediaQuery, useTheme } from '@mui/material'
import { FC, PropsWithChildren, ReactNode } from 'react'
import useThemeWidth from '../useThemeWidth'
import MobileDrawerNavigation from './MobileDrawerNavigation'
import NonMobileDrawerNavigation from './NonMobileDrawerNavigation'

const Drawer: FC<PropsWithChildren<{ title?: ReactNode }>> = ({
  children,
  title,
}) => {
  const theme = useTheme()
  const shouldUseMobileDrawer = useMediaQuery(theme.breakpoints.down('lg'))
  const Drawer = shouldUseMobileDrawer
    ? MobileDrawerNavigation
    : NonMobileDrawerNavigation

  const width = useThemeWidth()

  return (
    <Drawer title={title}>
      <Box
        component={'main'}
        sx={(theme) => ({
          flexGrow: 1,
          margin: '0 auto',
          maxWidth: `${width}px`,
          [theme.breakpoints.up('xs')]: {
            padding: '0 80px',
          },
          [theme.breakpoints.up('sm')]: {
            padding: '0 80px',
          },
          [theme.breakpoints.up('md')]: {
            padding: '0 80px',
          },
          [theme.breakpoints.up('lg')]: {
            padding: '48px 72px',
          },
          [theme.breakpoints.up('xl')]: {
            padding: '48px 48px',
          },
          [theme.breakpoints.down('xs')]: {
            padding: '0 80px',
          },
        })}
      >
        {children}
      </Box>
    </Drawer>
  )
}

export default Drawer
