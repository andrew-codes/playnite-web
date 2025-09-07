'use client'

import { Box, Divider, styled } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

const HeaderContainer = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}))

const Header: FC<PropsWithChildren<{}>> = ({ children, ...rest }) => {
  return (
    <Box
      sx={(theme) => ({
        marginBottom: `calc(${theme.spacing(22)})`,
        [theme.breakpoints.down('lg')]: {
          marginBottom: `calc(${theme.spacing(21.5)} + 1px)`,
        },
      })}
    >
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          top: 0,
          zIndex: 1000,
          backgroundColor: theme.palette.background.default,
          position: 'fixed',
          width: '100%',
          [theme.breakpoints.down('lg')]: {
            paddingTop: `${theme.spacing(12)}`,
            paddingBottom: `${theme.spacing(3)}`,
          },
          [theme.breakpoints.up('lg')]: {
            paddingTop: `${theme.spacing(7)}`,
            paddingBottom: `${theme.spacing(3)}`,
          },
        })}
      >
        <HeaderContainer {...rest}>{children}</HeaderContainer>
        <Divider
          sx={(theme) => ({ margin: 0, marginTop: 2, marginBottom: 2 })}
        />
      </Box>
    </Box>
  )
}

export default Header
