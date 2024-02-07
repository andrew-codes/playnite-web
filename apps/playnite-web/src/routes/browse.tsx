import { Button, styled } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { scrollTo } from '../api/client/state/layoutSlice'
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

const Title = styled('span')(({ theme }) => ({
  marginRigth: theme.spacing(8),
  textAlign: 'center',
  flex: 1,
}))

function Browse() {
  const { gamesOnPlatforms } = (useLoaderData() || {}) as unknown as {
    gamesOnPlatforms?: GameOnPlatform[]
  }

  const dispatch = useDispatch()

  const handleScrollTop = useCallback(() => {
    dispatch(scrollTo(0))
  }, [])

  return (
    <Drawer
      title={
        <Title>
          <Button variant="text" onClick={handleScrollTop}>
            My Games
          </Button>
        </Title>
      }
    >
      <MyLibrary gamesOnPlatforms={gamesOnPlatforms ?? []} />
    </Drawer>
  )
}

export default Browse
export { loader }
