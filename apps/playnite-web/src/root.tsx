import { css, Global } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { json, LinksFunction, LoaderFunctionArgs } from '@remix-run/node'
import {
  Links,
  Meta,
  MetaFunction,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useOutlet,
} from '@remix-run/react'
import { AnimatePresence } from 'framer-motion'
import { FC, useEffect } from 'react'
import { useStore } from 'react-redux'
import { createHead } from 'remix-island'
import { setDeviceFeatures } from './api/client/state/deviceFeaturesSlice'
import { UAParser } from './api/layout.server'
import Layout from './components/Layout'
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
  const ua = UAParser(request.headers.get('user-agent'))
  const type = ua?.device?.type ?? 'desktop'
  const device = {
    type,
    vendor: ua?.device?.vendor ?? null,
    model: ua?.device?.model ?? null,
  }

  return json({
    device,
  })
}

const Head = createHead(() => (
  <>
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="/public/icons/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/public/icons/apple-touch-icon.png" />
    <Meta />
    <Links />
  </>
))

const App: FC<{}> = () => {
  const { device, user } = useLoaderData<{
    device: {
      type: 'desktop' | 'tablet' | 'mobile'
      vendor: string | null
      model: string | null
    }
    user?: any
  }>()

  const store = useStore()

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
    store.dispatch(
      setDeviceFeatures({
        device,
        isTouchEnabled,
        orientation,
        isPwa,
      }),
    )
  }, [])
  useEffect(() => {
    const handleOrientationChange = (evt) => {
      setDeviceFeatures({ orientation: window.screen.orientation.type })
    }
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  const outlet = useOutlet()

  const theme = muiTheme(device.type ?? 'unknown')

  return (
    <>
      <Head />
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
        <Layout>
          <AnimatePresence mode="wait" initial={false}>
            <div>{outlet}</div>
          </AnimatePresence>
        </Layout>
      </ThemeProvider>
      <ScrollRestoration />
      <Scripts />
    </>
  )
}

export default App
export { Head, links, loader, meta }
