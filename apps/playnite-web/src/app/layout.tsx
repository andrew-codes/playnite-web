import { Metadata } from 'next'
import { FC, PropsWithChildren } from 'react'
import { Apollo } from '../feature/shared/components/Apollo'
import { Emotion } from '../feature/shared/components/Emotion'

const metadata: Metadata = {
  title: 'Playnite Web',
  description: 'Share your Playnite library with your friends!',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  icons: {
    icon: '/public/assets/icons/favicon.ico',
    shortcut: '/public/assets/icons/favicon-32x32.png',
    apple: '/public/assets/icons/favicon-16x16.png',
  },
  openGraph: {
    title: 'Playnite Web',
    description: 'Share your Playnite library with your friends!',
  },
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
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Emotion>
          <Apollo>{children}</Apollo>
        </Emotion>
      </body>
    </html>
  )
}

export default RootLayout
export { metadata }
