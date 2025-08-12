import { FilterAlt } from '@mui/icons-material'
import { Button, styled } from '@mui/material'
import { Outlet, useLocation, useNavigate, useParams } from '@remix-run/react'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { Game } from '../../.generated/types.generated'
import { $filterValuesForQuery } from '../api/client/state/librarySlice'
import Filters from '../components/Filters'
import IconButton from '../components/IconButton'
import Layout from '../components/Layout'
import MyLibrary from '../components/MyLibrary'
import { useNavigateInGrid } from '../components/NavigateInGrid/context'
import LibraryNavigation from '../components/Navigation/LibraryNavigation'
import MainNavigation from '../components/Navigation/MainNavigation'
import RightDrawer from '../components/RightDrawer'
import { useAllGames } from '../hooks/allGames'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

const Title = styled('span')(({ theme }) => ({
  textAlign: 'center',
  flex: 1,
}))

function UserLibrary() {
  const { nameFilter, filterItems } = useSelector($filterValuesForQuery)

  const params = useParams()
  const isOnDetailsPage = (pathname) =>
    new RegExp(
      `^/u/${params.username}/${params.libraryId}/Game:[1-9][0-9]*$`,
    ).test(pathname)

  const { loading, data, error } = useAllGames(params.libraryId ?? '')

  const games = !loading ? (data?.library?.games ?? []) : []
  if (error) {
    console.error(error, data)
  }

  const [trigger] = useNavigateInGrid()
  const handleScrollTop = (evt) => {
    trigger(0, 0)
  }

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

    navigate(`/u/${params.username}/${params.libraryId}`)
  }, [location.pathname, params.username, params.libraryId])
  const handleSelection = useCallback(
    (evt, game: Game) => {
      setRightDrawerOpen(true)
      navigate(`/u/${params.username}/${params.libraryId}/${game.id}`)
    },
    [params.username, params.libraryId],
  )

  return (
    <Layout
      title={
        <Title>
          <Button variant="text" onClick={handleScrollTop}>
            My Games
          </Button>
        </Title>
      }
      secondaryMenu={
        <IconButton
          aria-label="Open filter drawer"
          onClick={() => {
            setFiltersInDrawer(true)
            setRightDrawerOpen(true)
          }}
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
