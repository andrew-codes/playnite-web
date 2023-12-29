import {
  Links,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import { FC } from 'react'
import { createHead } from 'remix-island'
import { createGlobalStyle } from 'styled-components'

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

const Head = createHead(() => (
  <>
    <link rel="icon" href="data:image/x-icon;base64,AA" />
    <Meta />
    <Links />
  </>
))

const GlobalStyles = createGlobalStyle`
body {
  margin: 0;
  padding: 0;
  background-color: rgb(17, 17, 17);
  color: rgb(255, 255, 255);
}
`

const App: FC<{}> = () => (
  <>
    <Head />
    <GlobalStyles />
    <Outlet />
    <ScrollRestoration />
    <Scripts />
    <LiveReload />
  </>
)

export default App
export { Head, meta }
