'use client'

import { Box, ThemeProvider, useMediaQuery } from '@mui/material'
import { AnimatePresence } from 'framer-motion'
import { ComponentType, FC, PropsWithChildren, ReactNode } from 'react'
import OuterContainer from '../../../components/OuterContainer'
import muiTheme from '../../../muiTheme'
import Drawer from '../../mainNavigation/components/Drawer'
import NonMobileDrawerNavigation from '../../mainNavigation/components/NonMobileDrawerNavigation'
import { Reset } from './Reset'

const Layout: FC<
  PropsWithChildren<{
    navs: Array<ComponentType<{ open: boolean }>>
    secondaryMenu?: ReactNode
  }>
> = ({ children, navs, secondaryMenu }) => {
  const theme = muiTheme('desktop')

  const shouldUseNonMobileDrawer = useMediaQuery(theme.breakpoints.up('lg'))

  return (
    <>
      <ThemeProvider theme={theme}>
        <Reset />
        <AnimatePresence initial={false}>
          <div>
            {shouldUseNonMobileDrawer ? (
              <NonMobileDrawerNavigation navs={navs}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100vh',
                  }}
                >
                  <Drawer navs={navs} secondaryMenu={secondaryMenu}>
                    <OuterContainer>{children}</OuterContainer>
                  </Drawer>
                </Box>
              </NonMobileDrawerNavigation>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100vh',
                }}
              >
                <Drawer navs={navs} secondaryMenu={secondaryMenu}>
                  <OuterContainer>{children}</OuterContainer>
                </Drawer>
              </Box>
            )}
          </div>
        </AnimatePresence>
      </ThemeProvider>
    </>
  )
}

export { Layout }
