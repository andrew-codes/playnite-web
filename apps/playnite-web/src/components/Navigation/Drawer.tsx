import { Box, useMediaQuery, useTheme } from '@mui/material'
import { ComponentType, FC, PropsWithChildren, ReactNode } from 'react'
import MobileDrawerNavigation from './MobileDrawerNavigation'

const Drawer: FC<
  PropsWithChildren<{
    title?: ReactNode | undefined
    navs: Array<ComponentType<{ open: boolean }>>
    secondaryMenu?: ReactNode | undefined
  }>
> = ({ children, navs, title, secondaryMenu }) => {
  const theme = useTheme()
  const shouldUseMobileDrawer = useMediaQuery(theme.breakpoints.down('lg'))

  return shouldUseMobileDrawer ? (
    <MobileDrawerNavigation
      navs={navs}
      title={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          {secondaryMenu}
        </Box>
      }
    >
      <Box
        component={'main'}
        sx={(theme) => ({
          flexGrow: 1,
          width: '100%',
          height: '100%',
          margin: '0 auto',
          overflow: 'hidden',
          [theme.breakpoints.down('lg')]: {
            padding: `${theme.spacing(3)} ${theme.spacing(2)}`,
          },
        })}
      >
        {title}
        {children}
      </Box>
    </MobileDrawerNavigation>
  ) : (
    <Box
      component={'main'}
      sx={(theme) => ({
        flexGrow: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        overflow: 'hidden',
        [theme.breakpoints.up('lg')]: {
          padding: `${theme.spacing(11)} ${theme.spacing(5)} ${theme.spacing(6)} ${theme.spacing(16)}`,
        },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'absolute',
          flex: 1,
          top: theme.spacing(3),
          right: theme.spacing(3),
          zIndex: 1200,
        }}
      >
        {secondaryMenu}
      </Box>
      {title}
      {children}
    </Box>
  )
}

export default Drawer
