import { Box, Divider, styled } from '@mui/material'
import { FC, PropsWithChildren } from 'react'

const HeaderContainer = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-end',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}))

const Header: FC<PropsWithChildren<{}>> = ({ children, ...rest }) => {
  return (
    <>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          paddingTop: theme.spacing(4),
          top: 0,
          zIndex: 1000,
          backgroundColor: theme.palette.background.default,
          [theme.breakpoints.up('lg')]: {
            position: 'sticky',
          },
        })}
      >
        <HeaderContainer {...rest}>{children}</HeaderContainer>
        <Divider sx={(theme) => ({ margin: `${theme.spacing(4)} 0` })} />
      </Box>
    </>
  )
}

export default Header
