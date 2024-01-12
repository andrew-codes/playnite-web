import styled from '@emotion/styled'
import { FC, PropsWithChildren } from 'react'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from '../api/client/state/authSlice'
import { getIsMobile } from '../api/client/state/layoutSlice'

const Layout = styled.div<{ mobile: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100vh;

  > * {
    margin-top: 24px;
  }

  ${({ mobile }) =>
    mobile
      ? `:last-child {
    margin-top: 0;
  }`
      : `:first-child {
    margin-top: 0;
  }`}
`

const Navigation: FC<PropsWithChildren & { mobile: boolean }> = ({
  children,
  mobile,
  ...rest
}) => <nav {...rest}>{children}</nav>

const GlobalNavigation = styled(Navigation)`
  order: ${({ mobile }) => (mobile ? `1` : `0`)};

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 24px 48px !important;
  position: relative;

  > * {
    flex: 1;
    padding: 8px 16px;
    color: #fff;
    text-decoration: none;
    font-size: 2rem;
    text-align: center;

    &::visited {
      color: #fff;
    }

    &:first-child {
      text-align: left;
    }

    &:last-child {
      text-align: right;
    }
  }

  &:after {
    content: '';
    position: absolute;
    bottom: ${({ mobile }) => (mobile ? `unset` : `-24px`)};
    top: ${({ mobile }) => (mobile ? `-24px` : `unset`)};
    left: -16px;
    right: -16px;
    height: 2px;
    opacity: 0.25;
    background-color: lightblue;
  }
`

const WithNavigation: FC<PropsWithChildren & { Toolbar?: FC }> = ({
  children,
  Toolbar,
}) => {
  const isMobile = useSelector(getIsMobile)

  const isAuthenticated = useSelector(getIsAuthenticated)

  return (
    <Layout mobile={isMobile}>
      <GlobalNavigation mobile={isMobile}>
        <a href={`/`}>On Deck</a>
        {Toolbar && <Toolbar />}
        <a href={`/browse`}>Browse</a>
        {!isAuthenticated && <a href={`/login`}>Sign In</a>}
        {isAuthenticated && <a href={`/logout`}>Logout</a>}
      </GlobalNavigation>
      {children}
    </Layout>
  )
}

export default WithNavigation
