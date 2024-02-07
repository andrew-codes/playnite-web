import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import PlayniteApi from '../api/playnite/index.server'
import MyLibrary from '../components/MyLibrary'
import Drawer from '../components/Navigation/Drawer'
import type { GameOnPlatform } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const gamesOnPlatforms = await api.getGames()
  gamesOnPlatforms.sort((a, b) => {
    const aName = a.name
    const bName = b.name
    if (aName > bName) {
      return 1
    }
    if (aName < bName) {
      return -1
    }

    return 0
  })

  return json({
    gamesOnPlatforms,
  })
}

function Browse() {
  const { gamesOnPlatforms } = (useLoaderData() || {}) as unknown as {
    gamesOnPlatforms?: GameOnPlatform[]
  }

  return (
    <Drawer title={'My Games'}>
      <MyLibrary gamesOnPlatforms={gamesOnPlatforms ?? []} />
    </Drawer>
  )
}

export default Browse
export { loader }
