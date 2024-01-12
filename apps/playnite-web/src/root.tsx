import { ThemeProvider } from '@mui/material'
import { configureStore } from '@reduxjs/toolkit'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import { FC } from 'react'
import { Provider } from 'react-redux'
import { createHead } from 'remix-island'
import { createGlobalStyle } from 'styled-components'
import { authenticator } from './api/auth/auth.server'
import { reducer } from './api/client/state'
import { signedIn, signedOut } from './api/client/state/authSlice'
import { layoutDetermined } from './api/client/state/layoutSlice'
import inferredLayout from './api/server/layout'
import muiTheme from './muiTheme'

const meta: MetaFunction = () => {
  return [
    { title: 'Playnite Web' },
    {
      property: 'og:title',
      content: 'Playnite Web',
    },
    {
      name: 'description',
      content: 'Share your Playnite library with your friends!',
    },
  ]
}

async function loader({ request }: LoaderFunctionArgs) {
  const [gameWidth, gameHeight] =
    await inferredLayout.getGameDimensions(request)

  const isMobile = request.headers.get('user-agent')?.includes('Mobile')

  const user = await authenticator.isAuthenticated(request)

  return json({
    isMobile,
    gameWidth,
    gameHeight,
    user,
  })
}

const Head = createHead(() => (
  <>
    <link rel="icon" href="data:image/x-icon;base64,AA" />
    <Meta />
    <Links />
  </>
))

const GlobalStyles = createGlobalStyle`
body {
  background-color: rgb(17, 17, 17);
  box-sizing: border-box;
  color: rgb(255, 255, 255);
  font-size: 16px;
  line-height: 1;
  margin: 0;
  padding: 0;
  font-family: Lato, sans-serif;
}
`

const App: FC<{}> = () => {
  const { isMobile, gameWidth, gameHeight, user } = useLoaderData<{
    isMobile: boolean
    gameWidth: number
    gameHeight: number
    user?: any
  }>()

  const store = configureStore({ reducer })
  store.dispatch(layoutDetermined({ isMobile, gameWidth, gameHeight }))
  if (!!user) {
    store.dispatch(signedIn({ payload: null }))
  } else {
    store.dispatch(signedOut({ payload: null }))
  }

  return (
    <>
      <Head />
      <GlobalStyles />
      <ThemeProvider theme={muiTheme}>
        <Provider store={store}>
          <Outlet />
        </Provider>
      </ThemeProvider>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </>
  )
}

export default App
export { Head, loader, meta }
