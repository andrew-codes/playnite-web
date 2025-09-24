import { Metadata, Viewport } from 'next'
import { FC, PropsWithChildren } from 'react'
import { Apollo } from '../feature/shared/components/Apollo'
import { Emotion } from '../feature/shared/components/Emotion'
import { Redux } from '../feature/shared/components/Redux'

const metadata: Metadata = {
  title: 'Playnite Web',
  description: 'Share your Playnite library with your friends!',
  icons: {
    icon: '/assets/icons/favicon.ico',
    shortcut: '/assets/icons/favicon-32x32.png',
    apple: '/assets/icons/favicon-16x16.png',
  },
  openGraph: {
    title: 'Playnite Web',
    description: 'Share your Playnite library with your friends!',
  },
}

const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Emotion>
          <Redux>
            <Apollo>{children}</Apollo>
          </Redux>
        </Emotion>
      </body>
    </html>
  )
}

export default RootLayout
export { metadata, viewport }
