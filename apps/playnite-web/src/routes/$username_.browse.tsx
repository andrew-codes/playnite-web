import { FilterAlt } from '@mui/icons-material'
import { Button, styled } from '@mui/material'
import { Outlet, useLocation, useNavigate, useParams } from '@remix-run/react'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { Game } from '../../.generated/types.generated'
import { $filterValuesForQuery } from '../api/client/state/librarySlice'
import Filters from '../components/Filters'
import IconButton from '../components/IconButton'
import MyLibrary from '../components/MyLibrary'
import { useNavigateInGrid } from '../components/NavigateInGrid/context'
import Drawer from '../components/Navigation/Drawer'
import RightDrawer from '../components/RightDrawer'
import { useAllGames } from '../queryHooks/allGames'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

const isOnDetailsPage = (pathname) => /\/browse\/.+$/.test(pathname)

const Title = styled('span')(({ theme }) => ({
  textAlign: 'center',
  flex: 1,
}))

function Browse() {
  const { nameFilter, filterItems } = useSelector($filterValuesForQuery)

  const params = useParams<{ username: string }>()
  const { loading, data, error } = useAllGames(params.username ?? '')

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

    navigate(`/${params.username}/browse`)
  }, [location.pathname])
  const handleSelection = useCallback((evt, game: Game) => {
    setRightDrawerOpen(true)
    navigate(`/${params.username}/browse/${game.id}`)
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
