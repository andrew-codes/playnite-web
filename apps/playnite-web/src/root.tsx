import { css, Global } from '@emotion/react'
import { CssBaseline, ThemeProvider, Typography } from '@mui/material'
import { configureStore } from '@reduxjs/toolkit'
import { LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  isRouteErrorResponse,
  Links,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from '@remix-run/react'
import { FC, PropsWithChildren, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { reducer } from './api/client/state'
import { setDeviceFeatures } from './api/client/state/deviceFeaturesSlice'
import { UAParser } from './api/layout.server'
import Header from './components/Header'
import AppLayout from './components/Layout'
import MainNavigation from './components/Navigation/MainNavigation'
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
    {
      rel: 'manifest',
      href: '/manifest.webmanifest',
    },
    {
      rel: 'icon',
      href: '/icons/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/icons/apple-touch-icon.png',
    },
  ]
}

async function loader({ request }: LoaderFunctionArgs) {
  const ua = UAParser(request.headers.get('user-agent'))
  const type = ua?.device?.type ?? 'desktop'
  const device = {
    type,
    vendor: ua?.device?.vendor ?? null,
    model: ua?.device?.model ?? null,
  }

  return {
    device,
  }
}

const App: FC<{}> = () => {
  const dispatch = useDispatch()
  const d = useLoaderData<ReturnType<typeof loader>>()
  useEffect(() => {
    let isTouchEnabled = false
    let orientation: null | OrientationType = null
    let isPwa = false
    if (
      !!navigator &&
      'maxTouchPoints' in navigator &&
      (navigator.maxTouchPoints > 0 ||
        (navigator as unknown as any).msMaxTouchPoints > 0)
    ) {
      isTouchEnabled = true
    } else {
      const touchMq = matchMedia?.('(pointer:coarse)')
      if (touchMq?.media === '(pointer:coarse)' && !!touchMq.matches) {
        isTouchEnabled = true
      }
    }
    if ('screen' in window) {
      orientation = screen.orientation.type
    }
    const pwaMq = matchMedia('(display-mode: standalone)')
    if (pwaMq?.media === '(display-mode: standalone)' && !!pwaMq.matches) {
      isPwa = true
    }
    dispatch(
      setDeviceFeatures({
        device: d.device.type as any,
        isTouchEnabled,
        orientation,
        isPwa,
      }),
    )
  }, [d?.device])
  useEffect(() => {
    const handleOrientationChange = (evt) => {
      dispatch(
        setDeviceFeatures({ orientation: window.screen.orientation.type }),
      )
    }
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return <Outlet />
}

const Layout: FC<PropsWithChildren<{}>> = ({ children }) => {
  const store = configureStore({ reducer })

  const theme = muiTheme('desktop')

  return (
    <html lang="en-us" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <Meta />
        <Links />
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Global
            styles={css`
              * {
                scrollbar-color: ${theme.palette.text.primary}
                  ${theme.palette.background.default};
              }
              ::-webkit-scrollbar {
                background-color: ${theme.palette.background.default};
              }
              ::-webkit-scrollbar-thumb {
                background-color: ${theme.palette.text.primary};
                border-radius: 10px;
              }
              ::-webkit-scrollbar-button {
                display: none;
              }
              ::-webkit-scrollbar-track {
                background-color: ${theme.palette.background.default};
              }
            `}
          />
          <Provider store={store}>{children}</Provider>
        </ThemeProvider>
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  )
}

const ErrorBoundary: FC<{}> = () => {
  const error = useRouteError()
  let errorTitle = <Typography variant="h1">Unexpected Error</Typography>
  let content = (
    <Typography variant="body1">
      Oops, Something went wrong. Please try again later.
    </Typography>
  )

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      errorTitle = <Typography variant="h1">Forbidden</Typography>

      content = (
        <div className="error-container">
          <p>You don't have permission to access this page.</p>
        </div>
      )
    } else if (error.status === 404) {
      errorTitle = <Typography variant="h1">Not Found</Typography>
      content = (
        <div className="error-container">
          <p>This is not the page you are looking for...</p>
        </div>
      )
    } else {
      errorTitle = <Typography variant="h1">{error.statusText}</Typography>
    }
  }

  return (
    <AppLayout title={<Header>{errorTitle}</Header>} navs={[MainNavigation]}>
      {content}
    </AppLayout>
  )
}

export default App
export { ErrorBoundary, Layout, links, loader, meta }
