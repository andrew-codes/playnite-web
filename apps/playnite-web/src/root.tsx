import {
  Links,
  LiveReload,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
} from '@remix-run/react'

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

const App = () => {
  return (
    <html>
      <head>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Hello world!!!!</h1>
        <Outlet />

        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default App
export { meta }
