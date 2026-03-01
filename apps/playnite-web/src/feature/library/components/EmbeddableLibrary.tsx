'use client'

import { useQuery } from '@apollo/client/react'
import { FilterAlt, PlayArrow } from '@mui/icons-material'
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
import TopDrawer from '../../shared/components/TopDrawer'
import { GameDetails } from '../../game/components/GameDetails'
import Filtering from '../../filtering/components/Filtering'
import { AllGamesQuery } from '../queries'
import EmbeddableGames from './EmbeddableGames'
import EmbeddableOnDeck from './EmbeddableOnDeck'
import { NavigationRouterProvider } from '../../shared/hooks/useNavigationRouter'
import { NowPlayingContent } from './NowPlayingContent'
import { useNowPlayingGames } from '../hooks/nowPlayingGames'

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

const NowPlayingEmbeddableView = ({
  username,
  libraryId,
}: {
  username: string
  libraryId: string
}) => {
  return (
    <TopDrawer>
      <NowPlayingContent username={username} libraryId={libraryId} />
    </TopDrawer>
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
    back: () => navigate(-1),
    push: (path: string) => navigate(path),
  }

  const [result] = useMe()
  const isAuthenticated = result?.data?.me?.isAuthenticated ?? false

  const nowPlayingQuery = useNowPlayingGames(libraryId, {
    skip: !isAuthenticated,
  })
  const hasNowPlayingGames =
    (nowPlayingQuery.data?.library?.gamesNowPlaying?.length ?? 0) > 0

  let navs = [LibraryNavigation, LibrariesNavigation, MainNavigation]
  if (isAuthenticated) {
    navs = navs
      .slice(0, 2)
      .concat([AuthenticatedNavigation])
      .concat(navs.slice(2))
  }
  if (isAuthenticated && username === result.data?.me?.username) {
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
    navigate('/filters')
  }

  const handleOpenNowPlaying = () => {
    navigate('/now-playing')
  }

  return (
    <NavigationRouterProvider router={routerAdapter}>
      <Layout
        secondaryMenu={
          <>
            {isAuthenticated && hasNowPlayingGames && (
              <IconButton
                aria-label="Open now playing"
                onClick={handleOpenNowPlaying}
                name="open-now-playing"
              >
                <PlayArrow />
              </IconButton>
            )}
            <IconButton
              aria-label="Open filter drawer"
              onClick={handleOpenFilter}
              name="open-filter-drawer"
            >
              <FilterAlt />
            </IconButton>
          </>
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
            path="/now-playing"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} />
                <NowPlayingEmbeddableView username={username} libraryId={libraryId} />
              </>
            }
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
            path="/now-playing/game/:gameId"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} />
                <NowPlayingEmbeddableView username={username} libraryId={libraryId} />
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
    const validPaths = ['/', '/on-deck', '/filters', '/on-deck/filters', '/now-playing']
    const isValidPath = stored && (
      validPaths.includes(stored) ||
      stored.startsWith('/game/') ||
      stored.startsWith('/on-deck/game/') ||
      stored.startsWith('/now-playing/game/')
    )

    if (isValidPath) {
      savedPath = stored
    } else if (stored) {
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
