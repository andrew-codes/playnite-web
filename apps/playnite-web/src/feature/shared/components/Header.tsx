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
        marginBottom: `calc(${theme.spacing(11)} + 97px)`,
        [theme.breakpoints.down('lg')]: {
          marginBottom: `calc(${theme.spacing(8)} + 97px)`,
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
            padding: `${theme.spacing(12)} ${theme.spacing(2)} ${theme.spacing(3)} ${theme.spacing(2)}`,
          },
          [theme.breakpoints.up('lg')]: {
            padding: `${theme.spacing(7)} ${theme.spacing(5)} ${theme.spacing(3)} ${theme.spacing(16)}`,
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
