import { Box, useMediaQuery, useTheme } from '@mui/material'
import { AnimatePresence } from 'framer-motion'
import { ComponentType, FC, PropsWithChildren, ReactNode } from 'react'
import { configure, Provider } from './NavigateInGrid/context'
import Drawer from './Navigation/Drawer'
import NonMobileDrawerNavigation from './Navigation/NonMobileDrawerNavigation'
import OuterContainer from './OuterContainer'

const Layout: FC<
  PropsWithChildren<{
    navs: Array<ComponentType<{ open: boolean }>>
    title?: ReactNode
    secondaryMenu?: ReactNode
  }>
> = ({ children, navs, title, secondaryMenu }) => {
  const theme = useTheme()
  const shouldUseNonMobileDrawer = useMediaQuery(theme.breakpoints.up('lg'))

  const navigateInGrid = configure()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Provider value={navigateInGrid}></Provider>
      <div>
        {shouldUseNonMobileDrawer ? (
          <NonMobileDrawerNavigation navs={navs}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Drawer navs={navs} title={title}>
                <OuterContainer>{children}</OuterContainer>
              </Drawer>
            </Box>
          </NonMobileDrawerNavigation>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Drawer navs={navs} title={title} secondaryMenu={secondaryMenu}>
              <OuterContainer>{children}</OuterContainer>
            </Drawer>
          </Box>
        )}
      </div>
    </AnimatePresence>
  )
}

export default Layout
