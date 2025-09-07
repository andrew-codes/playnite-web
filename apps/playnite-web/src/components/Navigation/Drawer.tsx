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
          '>*>*': {
            paddingX: theme.spacing(2),
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
      })}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'fixed',
          flex: 1,
          top: theme.spacing(3),
          right: theme.spacing(3),
          zIndex: 1200,
        }}
      >
        {secondaryMenu}
      </Box>
      <Box
        sx={{
          '> * > *': {
            paddingRight: `${theme.spacing(5)} !important`,
            paddingLeft: `${theme.spacing(16)} !important`,
          },
        }}
      >
        {title}
        {children}
      </Box>
    </Box>
  )
}

export default Drawer
