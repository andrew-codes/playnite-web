import { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import { FC, PropsWithChildren } from 'react'
import { Apollo } from '../feature/shared/components/Apollo'
import { Emotion } from '../feature/shared/components/Emotion'
import { Redux } from '../feature/shared/components/Redux'
import { PwaRegister } from '../components/PwaRegister'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

const metadata: Metadata = {
  title: 'Playnite Web',
  description: 'Share your Playnite library with your friends!',
  icons: {
    icon: '/assets/icons/favicon.ico',
    shortcut: '/assets/icons/favicon-32x32.png',
    apple: '/assets/icons/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Playnite Web',
  },
  openGraph: {
    title: 'Playnite Web',
    description: 'Share your Playnite library with your friends!',
  },
}

const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6200ea',
}

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" className={roboto.className}>
      <head>
        <meta charSet="utf-8" />
        <meta name="application-name" content="Playnite Web" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Playnite" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png" />
      </head>
      <body>
        <PwaRegister />
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
