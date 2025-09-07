'use client'

import { QueryRef } from '@apollo/client/react'
import { Home } from '@mui/icons-material'
import { Box, ThemeProvider, useMediaQuery } from '@mui/material'
import { AnimatePresence } from 'framer-motion'
import { ComponentType, FC, PropsWithChildren, ReactNode, useMemo } from 'react'
import { User } from '../../../../.generated/types.generated'
import Drawer from '../../../components/Navigation/Drawer'
import NavMenu from '../../../components/Navigation/NavMenu'
import NonMobileDrawerNavigation from '../../../components/Navigation/NonMobileDrawerNavigation'
import OuterContainer from '../../../components/OuterContainer'
import muiTheme from '../../../muiTheme'
import { Reset } from './Reset'

const Layout: FC<
  PropsWithChildren<{
    navs: Array<
      ComponentType<{ open: boolean; meQueryRef: QueryRef<{ me: User }> }>
    >
    title?: ReactNode
    meQueryRef?: QueryRef<{ me: User }>
    secondaryMenu?: ReactNode
  }>
> = ({ children, navs, title, meQueryRef, secondaryMenu }) => {
  const theme = muiTheme('desktop')

  const shouldUseNonMobileDrawer = useMediaQuery(theme.breakpoints.up('lg'))

  const navigations: Array<FC<{ open: boolean }>> = useMemo(
    () =>
      meQueryRef
        ? /* eslint-disable react/display-name */
          navs.map((Nav, index) => ({ open }) => (
            <Nav key={index} open={open} meQueryRef={meQueryRef} />
          ))
        : [
            ({ open }) => (
              <NavMenu
                key="main"
                open={open}
                navItems={[
                  {
                    to: '/',
                    icon: <Home />,
                    text: 'Playnite Web Libraries',
                  },
                ]}
                title=""
              />
            ),
          ],
    [navs, meQueryRef],
  )

  return (
    <>
      <ThemeProvider theme={theme}>
        <Reset />
        <AnimatePresence initial={false}>
          <div>
            {shouldUseNonMobileDrawer ? (
              <NonMobileDrawerNavigation navs={navigations}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100vh',
                  }}
                >
                  <Drawer
                    navs={navigations}
                    title={title}
                    secondaryMenu={secondaryMenu}
                  >
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
                <Drawer
                  navs={navigations}
                  title={title}
                  secondaryMenu={secondaryMenu}
                >
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
