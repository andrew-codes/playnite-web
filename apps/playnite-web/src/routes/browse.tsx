import { FilterAlt } from '@mui/icons-material'
import { Button, styled } from '@mui/material'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from '@remix-run/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { scrollTo } from '../api/client/state/layoutSlice'
import { setFilterTypeValues } from '../api/client/state/librarySlice'
import getGameApi from '../api/game/index.server'
import Filters from '../components/Filters'
import IconButton from '../components/IconButton'
import MyLibrary from '../components/MyLibrary'
import Drawer from '../components/Navigation/Drawer'
import RightDrawer from '../components/RightDrawer'
import Game from '../domain/Game'
import GameOnPlatform from '../domain/GameOnPlatform'
import { GameOnPlatformDto, IGame } from '../domain/types'

const isOnDetailsPage = (location) => /\/browse\/.+$/.test(location.pathname)

async function loader({ request }: LoaderFunctionArgs) {
  const api = getGameApi()
  const games = await api.getGames()
  games.sort((a, b) => {
    const aName = a.toString()
    const bName = b.toString()
    if (aName > bName) {
      return 1
    }
    if (aName < bName) {
      return -1
    }

    return 0
  })

  const features = await api.getFeatures()

  return json({
    games: games,
    filterValues: {
      feature: features,
    },
  })
}

const Title = styled('span')(({ theme }) => ({
  textAlign: 'center',
  flex: 1,
}))

function Browse() {
  const data = (useLoaderData() || {}) as unknown as {
    games: GameOnPlatformDto[][]
    filterValues:
      | {
          feature: { id: string; name: string }[]
        }
      | undefined
  }

  const dispatch = useDispatch()
  useEffect(() => {
    Object.entries(data.filterValues ?? {}).forEach(([key, value]) => {
      dispatch(setFilterTypeValues({ filterTypeName: key, values: value }))
    })
  }, [data.filterValues])

  const handleScrollTop = useCallback(() => {
    dispatch(scrollTo(0))
  }, [])

  const location = useLocation()
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(
    isOnDetailsPage(location),
  )
  const [isFiltersInDrawer, setFiltersInDrawer] = useState(false)
  const navigate = useNavigate()
  const handleClose = useCallback(() => {
    setRightDrawerOpen(false)
    setFiltersInDrawer(false)
    if (!isOnDetailsPage(location)) {
      return
    }

    navigate(`/browse`)
  }, [])
  const handleSelection = useCallback((evt, game: IGame) => {
    setRightDrawerOpen(true)
    navigate(`/browse/${game.id.toString()}`)
  }, [])

  const games = useMemo(
    () =>
      data.games.map((g) => {
        return new Game(g.map((gp) => new GameOnPlatform(gp)))
      }),
    [data.games],
  )

  return (
    <Drawer
      title={
        <Title>
          <Button variant="text" onClick={handleScrollTop}>
            My Games
          </Button>
        </Title>
      }
      secondaryMenu={
        <IconButton
          onClick={() => {
            setFiltersInDrawer(true)
            setRightDrawerOpen(true)
          }}
          name="open-filter-drawer"
        >
          <FilterAlt />
        </IconButton>
      }
    >
      <MyLibrary games={games ?? []} onSelect={handleSelection} />
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {isFiltersInDrawer ? <Filters onClose={handleClose} /> : <Outlet />}
      </RightDrawer>
    </Drawer>
  )
}

export default Browse
export { loader }
