'use client'

import { useQuery } from '@apollo/client/react'
import { FilterAlt, PlayArrow } from '@mui/icons-material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Library } from '../../../../.generated/types.generated'
import { setCompletionStates } from '../../../api/client/state/completionStatesSlice'
import { activateFilters } from '../../../api/client/state/librarySlice'
import { useMe } from '../../account/hooks/me'
import AuthenticatedNavigation from '../../mainNavigation/components/AuthenticatedNavigation'
import LibrariesNavigation from '../../mainNavigation/components/LibrariesNavigation'
import LibraryNavigation from '../../mainNavigation/components/LibraryNavigation'
import MainNavigation from '../../mainNavigation/components/MainNavigation'
import IconButton from '../../shared/components/IconButton'
import { Layout } from '../../shared/components/Layout'
import { AllGamesQuery } from '../queries'
import { useNowPlayingGames } from '../hooks/nowPlayingGames'

interface LibraryGamesProps {
  username: string
  libraryId: string
  children: React.ReactNode
}

const LibraryLayout = ({
  username,
  libraryId,
  children,
}: LibraryGamesProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { data, error } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })

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

  // Sync filter state from URL query params to Redux on mount / URL change
  useEffect(() => {
    const nameFilter = searchParams.get('nameFilter') ?? ''
    const filtersParam = searchParams.get('filters')
    let filterItems: Array<{
      field: string
      value: Array<string>
      relatedType: string
    }> = []
    if (filtersParam) {
      try {
        filterItems = JSON.parse(filtersParam)
      } catch {
        filterItems = []
      }
    }
    dispatch(
      activateFilters({
        name: nameFilter === '' ? undefined : nameFilter,
        filterItems,
      }),
    )
  }, [searchParams, dispatch])

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
    const currentSearch = typeof window !== 'undefined' ? window.location.search : ''
    const libraryBasePath = `/u/${username}/${libraryId}`
    const isOnDeck = pathname.startsWith(`${libraryBasePath}/on-deck`)
    const filtersPath = isOnDeck
      ? `${libraryBasePath}/on-deck/filters`
      : `${libraryBasePath}/filters`
    router.push(`${filtersPath}${currentSearch}`)
  }

  const handleOpenNowPlaying = () => {
    router.push(`/u/${username}/${libraryId}/now-playing`)
  }

  return (
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
      {children}
    </Layout>
  )
}

export { LibraryLayout }
