// app/services/session.server.ts
import { createCookieSessionStorage } from '@remix-run/node'

// export the whole sessionStorage object
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session', // use any name you want here
    sameSite: 'strict',
    path: '/',
    httpOnly: true,
    secrets: [process.env.SECRET ?? 'secret'],
    secure: process.env.NODE_ENV === 'production',
  },
})

export { sessionStorage }
