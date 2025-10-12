import { Metadata, Viewport } from 'next'
import { Roboto } from 'next/font/google'
import { FC, PropsWithChildren } from 'react'
import { Apollo } from '../feature/shared/components/Apollo'
import { Emotion } from '../feature/shared/components/Emotion'
import { Redux } from '../feature/shared/components/Redux'

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
    <html lang="en" className={roboto.className}>
      <head>
        <meta charSet="utf-8" />
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
