import { CssBaseline, ThemeProvider } from '@mui/material'
import { configureStore } from '@reduxjs/toolkit'
import { LiveReload, useSWEffect } from '@remix-pwa/sw'
import { LinksFunction, LoaderFunctionArgs, json } from '@remix-run/node'
import {
  Links,
  Meta,
  MetaFunction,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useOutlet,
} from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
import { FC, useEffect } from 'react'
import { Provider } from 'react-redux'
import { createHead } from 'remix-island'
import { authenticator } from './api/auth/auth.server'
import { reducer } from './api/client/state'
import { signedIn, signedOut } from './api/client/state/authSlice'
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
  const user = await authenticator.isAuthenticated(request)

  const ua = UAParser(request.headers.get('user-agent'))
  const type = ua?.device?.type ?? 'desktop'
  const device = {
    type,
    vendor: ua?.device?.vendor ?? null,
    model: ua?.device?.model ?? null,
  }
  console.log(JSON.stringify(ua, null, 2))

  return json({
    user,
    device,
  })
}

const Head = createHead(() => (
  <>
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="icon" href="data:image/x-icon;base64,AA" />
    <Meta />
    <Links />
  </>
))

const App: FC<{}> = () => {
  useSWEffect()

  const store = configureStore({ reducer })

  const { device, user } = useLoaderData<{
    device: {
      type: 'desktop' | 'tablet' | 'mobile'
      vendor: string | null
      model: string | null
    }
    user?: any
  }>()

  if (!!user) {
    store.dispatch(signedIn({ payload: null }))
  } else {
    store.dispatch(signedOut({ payload: null }))
  }

  store.dispatch(setDeviceFeatures({ device }))
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
        isTouchEnabled,
        orientation,
        isPwa,
      }),
    )
  }, [])

  const outlet = useOutlet()
  const location = useLocation()

  return (
    <>
      <Head />
      <ThemeProvider theme={muiTheme()}>
        <CssBaseline />
        <Provider store={store}>
          <Layout>
            <AnimatePresence mode="wait" initial={false}>
              <motion.main
                key={location.pathname}
                initial={{ x: '-10%', opacity: 0 }}
                animate={{ x: '0', opacity: 1 }}
                exit={{ y: '-10%', opacity: 0 }}
                transition={{ duration: 0 }}
              >
                {outlet}
              </motion.main>
            </AnimatePresence>
          </Layout>
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
