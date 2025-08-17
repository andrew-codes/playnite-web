import { Box, Divider, styled } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

const HeaderContainer = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}))

const Header: FC<PropsWithChildren<{}>> = ({ children, ...rest }) => {
  return (
    <>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          top: 0,
          zIndex: 1000,
          backgroundColor: theme.palette.background.default,
          [theme.breakpoints.up('lg')]: {
            position: 'sticky',
          },
        })}
      >
        <HeaderContainer {...rest}>{children}</HeaderContainer>
        <Divider
          sx={(theme) => ({ margin: 0, marginTop: 2, marginBottom: 2 })}
        />
      </Box>
    </>
  )
}

export default Header
