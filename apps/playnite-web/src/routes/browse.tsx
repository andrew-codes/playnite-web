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
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { scrollTo } from '../api/client/state/layoutSlice'
import { setFilterTypeValues } from '../api/client/state/librarySlice'
import getGameApi from '../api/game/index.server'
import Filters from '../components/Filters'
import IconButton from '../components/IconButton'
import MyLibrary from '../components/MyLibrary'
import Drawer from '../components/Navigation/Drawer'
import RightDrawer from '../components/RightDrawer'
import type { GameOnPlatform } from '../domain/types'

async function loader({ request }: LoaderFunctionArgs) {
  const api = getGameApi()
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

  const features = await api.getFeatures()

  return json({
    gamesOnPlatforms,
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
  const { gamesOnPlatforms, filterValues } = (useLoaderData() ||
    {}) as unknown as {
    gamesOnPlatforms?: GameOnPlatform[]
    filterValues:
      | {
          feature: { id: string; name: string }[]
        }
      | undefined
  }

  const dispatch = useDispatch()
  useEffect(() => {
    Object.entries(filterValues ?? {}).forEach(([key, value]) => {
      dispatch(setFilterTypeValues({ filterTypeName: key, values: value }))
    })
  }, [])

  const handleScrollTop = useCallback(() => {
    dispatch(scrollTo(0))
  }, [])

  const location = useLocation()
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(
    location.pathname.includes('gamesonplatforms:'),
  )
  const [isFiltersInDrawer, setFiltersInDrawer] = useState(false)
  const navigate = useNavigate()
  const handleClose = useCallback(() => {
    setRightDrawerOpen(false)
    setFiltersInDrawer(false)
    navigate(`/browse`)
  }, [])

  const handleSelection = useCallback((evt, game) => {
    setRightDrawerOpen(true)
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
      <MyLibrary
        gamesOnPlatforms={gamesOnPlatforms ?? []}
        onSelect={handleSelection}
      />
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {isFiltersInDrawer ? <Filters onClose={handleClose} /> : <Outlet />}
      </RightDrawer>
    </Drawer>
  )
}

export default Browse
export { loader }
