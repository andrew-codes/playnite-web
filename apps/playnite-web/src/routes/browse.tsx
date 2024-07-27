import { gql } from '@apollo/client/core'
import { useQuery } from '@apollo/client/react/hooks/hooks.cjs'
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
import { Game } from '../server/graphql/types.generated'

const isOnDetailsPage = (pathname) => /\/browse\/.+$/.test(pathname)

async function loader({ request }: LoaderFunctionArgs) {
  const api = getGameApi()
  const features = await api.getFeatures()

  return json({
    filterValues: {
      feature: features,
    },
  })
}

const Title = styled('span')(({ theme }) => ({
  textAlign: 'center',
  flex: 1,
}))

const All_Games_Query = gql`
  query allGames {
    games {
      id
      cover {
        id
      }
      name
      description
      releases {
        id
        platform {
          id
          name
          icon {
            id
          }
        }
      }
    }
  }
`
function Browse() {
  const { filterValues } = (useLoaderData() || {}) as unknown as {
    filterValues:
      | {
          feature: { id: string; name: string }[]
        }
      | undefined
  }

  const { loading, data, error } = useQuery(All_Games_Query)
  const games = !loading && !error ? data.games : []

  const dispatch = useDispatch()
  useEffect(() => {
    Object.entries(filterValues ?? {}).forEach(([key, value]) => {
      dispatch(setFilterTypeValues({ filterTypeName: key, values: value }))
    })
  }, [filterValues])

  const handleScrollTop = useCallback(() => {
    dispatch(scrollTo(0))
  }, [])

  const location = useLocation()
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(
    isOnDetailsPage(location.pathname),
  )
  const [isFiltersInDrawer, setFiltersInDrawer] = useState(false)
  const navigate = useNavigate()
  const handleClose = useCallback(() => {
    setRightDrawerOpen(false)
    setFiltersInDrawer(false)
    if (!isOnDetailsPage(location.pathname)) {
      return
    }

    navigate(`/browse`)
  }, [location.pathname])
  const handleSelection = useCallback((evt, game: Game) => {
    setRightDrawerOpen(true)
    navigate(`/browse/${game.id}`)
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
      <MyLibrary games={games} onSelect={handleSelection} />
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {isFiltersInDrawer ? <Filters onClose={handleClose} /> : <Outlet />}
      </RightDrawer>
    </Drawer>
  )
}

export default Browse
export { loader }
