import { FilterAlt } from '@mui/icons-material'
import { Typography } from '@mui/material'
import {
  Location,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from '@remix-run/react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Game } from '../../.generated/types.generated'
import { setCompletionStates } from '../api/client/state/completionStatesSlice'
import Filters from '../components/Filters'
import Header from '../components/Header'
import IconButton from '../components/IconButton'
import Layout from '../components/Layout'
import MyLibrary from '../components/MyLibrary'
import { useNavigateInGrid } from '../components/NavigateInGrid/context'
import LibraryNavigation from '../components/Navigation/LibraryNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import RightDrawer from '../components/RightDrawer'
import { useAllGames } from '../hooks/allGames'
import { useFilteredGames } from '../hooks/useFilteredGames'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

function UserLibrary() {
  const params = useParams()
  const isOnDetailsPage = (location: Location) =>
    new RegExp(
      `^/u/${params.username}/${params.libraryId}/Game:[1-9][0-9]*$`,
    ).test(location.pathname)
  const isOnFilterPane = (location: Location) =>
    new RegExp(`^/u/${params.username}/${params.libraryId}`).test(
      location.pathname,
    ) && location.search.includes('showFilterPane=true')

  const dispatch = useDispatch()
  const { data, error } = useAllGames(params.libraryId, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  })
  useEffect(() => {
    if (!data?.library?.completionStates) {
      return
    }
    dispatch(setCompletionStates(data.library.completionStates))
  }, [data?.library?.completionStates])

  const games = useFilteredGames(data?.library?.games ?? [])
  if (error) {
    console.error(error, data)
  }

  const [trigger] = useNavigateInGrid()
  const handleScrollTop = (evt) => {
    trigger(0, 0)
  }

  const location = useLocation()

  const [isRightDrawerOpen, setRightDrawerOpen] = useState(
    isOnDetailsPage(location) || isOnFilterPane(location),
  )
  const [isFiltersInDrawer, setFiltersInDrawer] = useState(
    isOnFilterPane(location),
  )
  useEffect(() => {
    setRightDrawerOpen(isOnDetailsPage(location) || isOnFilterPane(location))
    setFiltersInDrawer(isOnFilterPane(location))
  }, [location])

  const navigate = useNavigate()
  const handleClose = useCallback(() => {
    navigate(`/u/${params.username}/${params.libraryId}`)
  }, [location, params.username, params.libraryId])
  const handleSelection = useCallback(
    (evt, game: Game) => {
      navigate(`/u/${params.username}/${params.libraryId}/${game.id}`)
    },
    [params.username, params.libraryId],
  )

  const handleOpenFilter = () => {
    navigate(`/u/${params.username}/${params.libraryId}?showFilterPane=true`)
  }

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">My Games</Typography>
          <Typography variant="subtitle1">
            <span>{games.length}</span>&nbsp;games in library
          </Typography>
        </Header>
        // <Title>
        //   <Button variant="text" onClick={handleScrollTop}>
        //     My Games
        //   </Button>
        // </Title>
      }
      secondaryMenu={
        <IconButton
          aria-label="Open filter drawer"
          onClick={handleOpenFilter}
          name="open-filter-drawer"
        >
          <FilterAlt />
        </IconButton>
      }
      navs={[LibraryNavigation, MainNavigation]}
    >
      <MyLibrary games={games} onSelect={handleSelection} />
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {isFiltersInDrawer ? <Filters onClose={handleClose} /> : <Outlet />}
      </RightDrawer>
    </Layout>
  )
}

type SearchParams = { username: string; libraryId: string }

export default UserLibrary
export { loader, type SearchParams }
