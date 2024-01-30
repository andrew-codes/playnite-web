import { CacheProvider } from '@emotion/react'
import type { AppLoadContext, EntryContext } from '@remix-run/node'
import { createReadableStreamFromReadable } from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import mediaQuery from 'css-mediaquery'
import isbot from 'isbot'
import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { Helmet } from 'react-helmet'
import { renderHeadToString } from 'remix-island'
import { preloadRouteAssets } from 'remix-utils/preload-route-assets'
import { UAParser } from 'ua-parser-js'
import createEmotionCache from './createEmotionCache'
import { Head } from './root'

const ABORT_DELAY = 5_000

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  return isbot(request.headers.get('user-agent'))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
      )
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false
    const clientSideCache = createEmotionCache()
    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={clientSideCache}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </CacheProvider>,
      {
        onAllReady() {
          shellRendered = true
          const head = renderHeadToString({ request, remixContext, Head })
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )

          body.write(
            `<!DOCTYPE html><html><head>${head}</head><body><div id="root">`,
          )
          pipe(body)
          body.write(`</div></body></html>`)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    const ua = UAParser(request.headers.get('user-agent'))
    const deviceType = ua?.device?.type ?? 'desktop'
    const ssrMatchMedia = (query) => ({
      matches: mediaQuery.match(query, {
        minWidth:
          deviceType === 'mobile'
            ? '390px'
            : deviceType === 'tablet'
              ? '1024px'
              : '1441px',
        width:
          deviceType === 'mobile'
            ? '390px'
            : deviceType === 'tablet'
              ? '1024px'
              : '1441px',
      }),
    })

    let shellRendered = false
    const clientSideCache = createEmotionCache()
    const { pipe, abort } = renderToPipeableStream(
      <CacheProvider value={clientSideCache}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </CacheProvider>,
      {
        onAllReady() {
          preloadRouteAssets(remixContext, responseHeaders)
        },
        onShellReady() {
          shellRendered = true
          const head = renderHeadToString({ request, remixContext, Head })
          const helmet = Helmet.renderStatic()
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set('Content-Type', 'text/html')

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )
          body.write(
            `<!DOCTYPE html><html><head>${head}${helmet.link.toString()}</head><body><div id="root">`,
          )
          pipe(body)
          body.write(`</div></body></html>`)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
      },
    )

    setTimeout(abort, ABORT_DELAY)
  })
}
