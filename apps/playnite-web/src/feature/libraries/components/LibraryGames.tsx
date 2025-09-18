'use client'

import { FilterAlt } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Game } from '../../../../.generated/types.generated'
import { setCompletionStates } from '../../../api/client/state/completionStatesSlice'
import Filters from '../../../components/Filters'
import Header from '../../../components/Header'
import IconButton from '../../../components/IconButton'
import MyLibrary from '../../../components/MyLibrary'
import { useNavigateInGrid } from '../../../components/NavigateInGrid/context'
import LibraryNavigation from '../../../components/Navigation/LibraryNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import RightDrawer from '../../../components/RightDrawer'
import { Layout } from '../../shared/components/Layout'
import { useAllGames } from '../hooks/allGames'
import { useFilteredGames } from '../hooks/useFilteredGames'

interface LibraryGamesProps {
  username: string
  libraryId: string
}

const LibraryGames = ({ username, libraryId }: LibraryGamesProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isOnDetailsPage = (pathname: string) =>
    new RegExp(`^/u/${username}/${libraryId}/Game:[1-9][0-9]*$`).test(pathname)

  const isOnFilterPane = () => searchParams.get('showFilterPane') === 'true'

  const dispatch = useDispatch()
  const { data, error } = useAllGames(libraryId, {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  })

  useEffect(() => {
    if (!data?.library?.completionStates) {
      return
    }
    dispatch(setCompletionStates(data.library.completionStates))
  }, [data?.library?.completionStates, dispatch])

  const games = useFilteredGames(data?.library?.games ?? [])

  if (error) {
    console.error(error, data)
  }

  const [trigger] = useNavigateInGrid()
  const handleScrollTop = () => {
    trigger(0, 0)
  }

  const [isRightDrawerOpen, setRightDrawerOpen] = useState(isOnFilterPane())
  const [isFiltersInDrawer, setFiltersInDrawer] = useState(isOnFilterPane())

  useEffect(() => {
    const filterPaneOpen = isOnFilterPane()
    setRightDrawerOpen(filterPaneOpen)
    setFiltersInDrawer(filterPaneOpen)
  }, [searchParams])

  const handleClose = useCallback(() => {
    router.push(`/u/${username}/${libraryId}`)
  }, [router, username, libraryId])

  const handleSelection = useCallback(
    (evt: any, game: Game) => {
      router.push(`/u/${username}/${libraryId}/${game.id}`)
    },
    [router, username, libraryId],
  )

  const handleOpenFilter = () => {
    router.push(`/u/${username}/${libraryId}?showFilterPane=true`)
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
        {isFiltersInDrawer ? <Filters onClose={handleClose} /> : null}
      </RightDrawer>
    </Layout>
  )
}

export { LibraryGames }
