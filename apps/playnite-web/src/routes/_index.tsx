import { Typography } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PlayniteApi from '../api/playnite/index.server'
import { Playlist } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()

  const playing = await api.getPlaylistByName('On Deck')

  return json({
    playing,
  })
}

function Index() {
  const { playing } = (useLoaderData() || {}) as unknown as {
    playing?: Playlist
  }

  return (
    <>
      <Typography variant="h1">Library</Typography>
      <Typography variant="h3">{playing?.name}</Typography>
    </>
  )
}

export default Index
export { loader }
