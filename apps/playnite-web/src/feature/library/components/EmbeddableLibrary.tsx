'use client'

import { useQuery } from '@apollo/client/react'
import { FilterAlt } from '@mui/icons-material'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import { Library } from '../../../../.generated/types.generated'
import { setCompletionStates } from '../../../api/client/state/completionStatesSlice'
import { useMe } from '../../account/hooks/me'
import AuthenticatedNavigation from '../../mainNavigation/components/AuthenticatedNavigation'
import LibrariesNavigation from '../../mainNavigation/components/LibrariesNavigation'
import LibraryNavigation from '../../mainNavigation/components/LibraryNavigation'
import MainNavigation from '../../mainNavigation/components/MainNavigation'
import IconButton from '../../shared/components/IconButton'
import { Layout } from '../../shared/components/Layout'
import { PageTitle } from '../../shared/components/PageTitle'
import RightDrawer from '../../shared/components/RightDrawer'
import { GameDetails } from '../../game/components/GameDetails'
import Filtering from '../../filtering/components/Filtering'
import { AllGamesQuery } from '../queries'
import EmbeddableGames from './EmbeddableGames'
import EmbeddableOnDeck from './EmbeddableOnDeck'
import { NavigationRouterProvider } from '../../shared/hooks/useNavigationRouter'

interface EmbeddableLibraryProps {
  username: string
  libraryId: string
}

const LibraryView = ({
  username,
  libraryId,
}: {
  username: string
  libraryId: string
}) => {
  const { data } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })

  return (
    <>
      <PageTitle
        title={`My Games - ${data?.library?.name ?? ''}`}
        subtitle={`${data?.library?.games.length ?? 0} ${data?.library?.games.length === 1 ? 'game' : 'games'}`}
      />
      <EmbeddableGames
        username={username}
        libraryId={libraryId}
        games={data?.library?.games ?? []}
      />
    </>
  )
}

const GameDetailsView = () => {
  const { gameId } = useParams<{ gameId: string }>()

  if (!gameId) return null

  return (
    <RightDrawer>
      <GameDetails gameId={gameId} />
    </RightDrawer>
  )
}

const FiltersView = () => {
  return (
    <RightDrawer>
      <Filtering />
    </RightDrawer>
  )
}

const EmbeddableLibraryContent = ({
  username,
  libraryId,
}: EmbeddableLibraryProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const { data, error } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })

  // Persist navigation state to localStorage
  useEffect(() => {
    const storageKey = `embeddable-library-${username}-${libraryId}`
    localStorage.setItem(storageKey, location.pathname)
  }, [location.pathname, username, libraryId])

  // Create router adapter for react-router
  const routerAdapter = {
    back: () => {
      console.log('RouterAdapter: back() called, navigating to -1')
      navigate(-1)
    },
    push: (path: string) => {
      console.log('RouterAdapter: push() called with path:', path)
      navigate(path)
    },
  }

  const [result] = useMe()
  let navs = [LibraryNavigation, LibrariesNavigation, MainNavigation]
  if (result?.data?.me?.isAuthenticated) {
    navs = navs
      .slice(0, 2)
      .concat([AuthenticatedNavigation])
      .concat(navs.slice(2))
  }
  if (
    result?.data?.me?.isAuthenticated &&
    username === result.data.me.username
  ) {
    navs = navs.filter((nav) => nav !== LibrariesNavigation)
  }

  const dispatch = useDispatch()
  useEffect(() => {
    if (!data?.library?.completionStates) {
      return
    }
    dispatch(
      setCompletionStates(
        data.library.completionStates.filter(
          (s) => s && s?.id && s?.name,
        ) as Array<{ id: string; name: string }>,
      ),
    )
  }, [data?.library?.completionStates, dispatch])

  if (error) {
    console.error(error, data)
  }

  const handleOpenFilter = () => {
    console.log('EmbeddableLibrary: Opening filters')
    navigate('/filters')
  }

  return (
    <NavigationRouterProvider router={routerAdapter}>
      <Layout
        secondaryMenu={
          <IconButton
            aria-label="Open filter drawer"
            onClick={handleOpenFilter}
            name="open-filter-drawer"
          >
            <FilterAlt />
          </IconButton>
        }
        navs={navs}
      >
        <Routes>
          <Route
            path="/"
            element={<LibraryView username={username} libraryId={libraryId} />}
          />
          <Route
            path="/on-deck"
            element={<EmbeddableOnDeck username={username} libraryId={libraryId} />}
          />
          <Route
            path="/game/:gameId"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} />
                <GameDetailsView />
              </>
            }
          />
          <Route
            path="/on-deck/game/:gameId"
            element={
              <>
                <EmbeddableOnDeck username={username} libraryId={libraryId} />
                <GameDetailsView />
              </>
            }
          />
          <Route
            path="/filters"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} />
                <FiltersView />
              </>
            }
          />
          <Route
            path="/on-deck/filters"
            element={
              <>
                <EmbeddableOnDeck username={username} libraryId={libraryId} />
                <FiltersView />
              </>
            }
          />
        </Routes>
      </Layout>
    </NavigationRouterProvider>
  )
}

const EmbeddableLibrary = ({ username, libraryId }: EmbeddableLibraryProps) => {
  // Restore navigation state from localStorage
  const storageKey = `embeddable-library-${username}-${libraryId}`
  let savedPath = '/'
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey)
    // Validate that the stored path is one of our valid routes
    const validPaths = ['/', '/on-deck', '/filters', '/on-deck/filters']
    const isValidPath = stored && (
      validPaths.includes(stored) || 
      stored.startsWith('/game/') || 
      stored.startsWith('/on-deck/game/')
    )
    
    if (isValidPath) {
      savedPath = stored
      console.log('EmbeddableLibrary: Restoring path from localStorage:', savedPath)
    } else if (stored) {
      console.log('EmbeddableLibrary: Invalid stored path, using default:', stored)
      // Clear invalid path
      localStorage.removeItem(storageKey)
    }
  }

  return (
    <MemoryRouter initialEntries={[savedPath]}>
      <EmbeddableLibraryContent username={username} libraryId={libraryId} />
    </MemoryRouter>
  )
}

export default EmbeddableLibrary
