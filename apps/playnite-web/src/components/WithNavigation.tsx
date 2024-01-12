import { Button, styled } from '@mui/material'
import { FC, PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from '../api/client/state/authSlice'

const Layout = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  // flex: 1,
  height: '100vh',

  '> *:first-child': {
    marginTop: '24px',
  },
  '> *:last-child': {
    flex: 1,
  },
}))

const GlobalNavigation = styled('nav')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  position: 'relative',
  order: 1,
  width: '100%',

  '> *': {
    flex: 1,
    padding: '8px 16px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '6px !important¸˛Í',

    '&:visited': {
      color: '#fff',
    },

    '&:first-child': {
      textAlign: 'left',
    },

    '&:last-child': {
      textAlign: 'right',
    },
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    top: '-12px',
    left: '0',
    right: '0',
    height: '2px',
    opacity: 0.25,
    backgroundColor: 'lightblue',
  },
}))

const WithNavigation: FC<PropsWithChildren & { Toolbar?: FC }> = ({
  children,
  Toolbar,
}) => {
  const isAuthenticated = useSelector(getIsAuthenticated)

  return (
    <Layout>
      <GlobalNavigation>
        <Button href={`/`}>On Deck</Button>
        {Toolbar && <Toolbar />}
        <Button href={`/browse`}>Browse</Button>
        {!isAuthenticated && <Button href={`/login`}>Sign In</Button>}
        {isAuthenticated && <Button href={`/logout`}>Logout</Button>}
      </GlobalNavigation>
      <div>{children}</div>
    </Layout>
  )
}

export default WithNavigation
