'use client'

import { useMutation, useQuery } from '@apollo/client/react'
import { FilterAlt, PlayArrow } from '@mui/icons-material'
import { FC, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom'
import { Game, Library } from '../../../../.generated/types.generated'
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
import {
  AllGamesQuery,
  LibraryLastRouteQuery,
  UpdateLastRouteMutation,
} from '../queries'
import Games from './Games'
import OnDeck from './OnDeck'
import { NavigationRouterProvider } from '../../shared/hooks/useNavigationRouter'
import { NowPlayingContent } from './NowPlayingContent'
import { useNowPlayingGames } from '../hooks/nowPlayingGames'

interface EmbeddableLibraryProps {
  username: string
  libraryId: string
}

const validPaths = ['/', '/on-deck', '/filters', '/on-deck/filters', '/now-playing']

function isValidRoute(path: string | null | undefined): path is string {
  if (!path) return false
  return (
    validPaths.includes(path) ||
    path.startsWith('/game/') ||
    path.startsWith('/on-deck/game/') ||
    path.startsWith('/now-playing/game/')
  )
}

function getInitialEntries(savedPath: string): string[] {
  if (savedPath.startsWith('/game/')) return ['/', savedPath]
  if (savedPath.startsWith('/on-deck/game/')) return ['/on-deck', savedPath]
  if (savedPath.startsWith('/now-playing/game/')) return ['/now-playing', savedPath]
  if (savedPath === '/filters') return ['/', savedPath]
  if (savedPath === '/on-deck/filters') return ['/on-deck', savedPath]
  if (savedPath === '/now-playing') return ['/', savedPath]
  return [savedPath]
}

const LibraryView = ({
  username,
  libraryId,
  onSelectGame,
}: {
  username: string
  libraryId: string
  onSelectGame?: (evt: React.MouseEvent, game: Game) => void
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
      <Games
        username={username}
        libraryId={libraryId}
        games={data?.library?.games ?? []}
        onSelectGame={onSelectGame}
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

const EmbeddableLibraryNav: FC<{ open: boolean }> = ({ open }) => {
  const navigate = useNavigate()
  return <LibraryNavigation open={open} navigate={navigate} />
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

  const [result] = useMe()
  const isAuthenticated = result?.data?.me?.isAuthenticated ?? false

  const [updateLastRoute] = useMutation(UpdateLastRouteMutation)

  // Persist navigation state server-side when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    updateLastRoute({ variables: { libraryId, route: location.pathname } })
  }, [location.pathname, libraryId, isAuthenticated, updateLastRoute])

  // Create router adapter for react-router
  const routerAdapter = {
    back: () => navigate(-1),
    push: (path: string) => navigate(path),
  }

  const nowPlayingQuery = useNowPlayingGames(libraryId, {
    skip: !isAuthenticated,
  })
  const hasNowPlayingGames =
    (nowPlayingQuery.data?.library?.gamesNowPlaying?.length ?? 0) > 0

  let navs = [EmbeddableLibraryNav, LibrariesNavigation, MainNavigation]
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

  const handleSelectGame = useCallback(
    (evt: React.MouseEvent, game: Game) => {
      if (location.pathname.startsWith('/on-deck')) {
        navigate(`/on-deck/game/${game.id}`)
      } else {
        navigate(`/game/${game.id}`)
      }
    },
    [navigate, location.pathname],
  )

  const handleOpenFilter = () => {
    if (location.pathname.startsWith('/on-deck')) {
      navigate('/on-deck/filters')
    } else {
      navigate('/filters')
    }
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
            element={<LibraryView username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />}
          />
          <Route
            path="/on-deck"
            element={<OnDeck username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />}
          />
          <Route
            path="/now-playing"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />
                <NowPlayingEmbeddableView username={username} libraryId={libraryId} />
              </>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />
                <GameDetailsView />
              </>
            }
          />
          <Route
            path="/now-playing/game/:gameId"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />
                <NowPlayingEmbeddableView username={username} libraryId={libraryId} />
                <GameDetailsView />
              </>
            }
          />
          <Route
            path="/on-deck/game/:gameId"
            element={
              <>
                <OnDeck username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />
                <GameDetailsView />
              </>
            }
          />
          <Route
            path="/filters"
            element={
              <>
                <LibraryView username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />
                <FiltersView />
              </>
            }
          />
          <Route
            path="/on-deck/filters"
            element={
              <>
                <OnDeck username={username} libraryId={libraryId} onSelectGame={handleSelectGame} />
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
  const { data, loading } = useQuery<{ library: Library }>(
    LibraryLastRouteQuery,
    { variables: { libraryId }, errorPolicy: 'all' },
  )

  if (loading) return null

  const savedPath = isValidRoute(data?.library?.lastRoute)
    ? data.library.lastRoute
    : '/'

  const initialEntries = getInitialEntries(savedPath)

  return (
    <MemoryRouter initialEntries={initialEntries}>
      <EmbeddableLibraryContent username={username} libraryId={libraryId} />
    </MemoryRouter>
  )
}

export default EmbeddableLibrary
