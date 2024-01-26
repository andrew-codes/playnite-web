import { CssBaseline, ThemeProvider } from '@mui/material'
import { configureStore } from '@reduxjs/toolkit'
import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node'
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
import { FC, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { createHead } from 'remix-island'
import { authenticator } from './api/auth/auth.server'
import { reducer } from './api/client/state'
import { signedIn, signedOut } from './api/client/state/authSlice'
import { setDeviceType } from './api/client/state/layoutSlice'
import { UAParser } from './api/layout.server'
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
    {
      name: 'viewport',
      content: 'initial-scale=1, width=device-width',
    },
  ]
}

const links: LinksFunction = () => {
  return [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap',
    },
  ]
}

async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request)
  const ua = UAParser(request.headers.get('user-agent'))
  const deviceType = ua?.device?.type ?? 'desktop'

  return json({
    user,
    deviceType: deviceType,
  })
}

const Head = createHead(() => (
  <>
    <link rel="icon" href="data:image/x-icon;base64,AA" />
    <Meta />
    <Links />
  </>
))

const App: FC<{}> = () => {
  const { deviceType: serverDeviceType, user } = useLoaderData<{
    deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown'
    user?: any
  }>()

  const store = configureStore({ reducer })

  const [deviceType, setDeviceTypeState] = useState<
    'mobile' | 'tablet' | 'desktop' | 'unknown' | null
  >(serverDeviceType)
  useEffect(() => {
    if (
      !!navigator &&
      'maxTouchPoints' in navigator &&
      navigator.maxTouchPoints > 0
    ) {
      setDeviceTypeState('tablet')
    } else if (
      !!navigator &&
      'msMaxTouchPoints' in navigator &&
      (navigator as unknown as any).msMaxTouchPoints > 0
    ) {
      setDeviceTypeState('tablet')
    } else {
      const mQ = matchMedia?.('(pointer:coarse)')
      if (mQ?.media === '(pointer:coarse)' && !!mQ.matches) {
        setDeviceTypeState('tablet')
      } else if ('orientation' in window) {
        setDeviceTypeState('tablet')
      }
    }
  }, [])

  store.dispatch(setDeviceType(deviceType))

  if (!!user) {
    store.dispatch(signedIn({ payload: null }))
  } else {
    store.dispatch(signedOut({ payload: null }))
  }

  return (
    <>
      <Head />
      <ThemeProvider theme={muiTheme()}>
        <CssBaseline />
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
export { Head, links, loader, meta }
