import { Box, useMediaQuery, useTheme } from '@mui/material'
import { FC, PropsWithChildren, ReactNode } from 'react'
import MobileDrawerNavigation from './MobileDrawerNavigation'

const Drawer: FC<
  PropsWithChildren<{
    title?: ReactNode | undefined
    secondaryMenu?: ReactNode | undefined
  }>
> = ({ children, secondaryMenu, title }) => {
  const theme = useTheme()
  const shouldUseMobileDrawer = useMediaQuery(theme.breakpoints.down('lg'))

  return shouldUseMobileDrawer ? (
    <MobileDrawerNavigation
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {title}
          <Box sx={{ alignSelf: 'flex-end' }}>{secondaryMenu}</Box>
        </Box>
      }
    >
      <Box
        component={'main'}
        sx={(theme) => ({
          flexGrow: 1,
          margin: '0 auto',
          [theme.breakpoints.up('xs')]: {
            padding: '0',
          },
          [theme.breakpoints.up('sm')]: {
            padding: '0',
          },
          [theme.breakpoints.up('md')]: {
            padding: '0',
          },
          [theme.breakpoints.up('lg')]: {
            padding: '48px 0 48px 88px',
          },
          [theme.breakpoints.up('xl')]: {
            padding: '48px 0 48px 88px',
          },
          [theme.breakpoints.down('xs')]: {
            padding: '0',
          },
        })}
      >
        {children}
      </Box>
    </MobileDrawerNavigation>
  ) : (
    <Box
      component={'main'}
      sx={(theme) => ({
        flexGrow: 1,
        margin: '0 auto',
        [theme.breakpoints.up('xs')]: {
          padding: '0',
        },
        [theme.breakpoints.up('sm')]: {
          padding: '0',
        },
        [theme.breakpoints.up('md')]: {
          padding: '0',
        },
        [theme.breakpoints.up('lg')]: {
          padding: '48px 0 48px 88px',
        },
        [theme.breakpoints.up('xl')]: {
          padding: '48px 0 48px 88px',
        },
        [theme.breakpoints.down('xs')]: {
          padding: '0',
        },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 1500,
        }}
      >
        {secondaryMenu}
      </Box>
      {children}
    </Box>
  )
}

export default Drawer
