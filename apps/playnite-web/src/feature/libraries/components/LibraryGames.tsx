'use client'

import { TransportedQueryRef } from '@apollo/client-integration-nextjs'
import { useReadQuery } from '@apollo/client/react'
import { FilterAlt } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Game } from '../../../../.generated/types.generated'
import { setCompletionStates } from '../../../api/client/state/completionStatesSlice'
import Filters from '../../../components/Filters'
import IconButton from '../../../components/IconButton'
import MyLibrary from '../../../components/MyLibrary'
import { useNavigateInGrid } from '../../../components/NavigateInGrid/context'
import LibraryNavigation from '../../../components/Navigation/LibraryNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import RightDrawer from '../../../components/RightDrawer'
import Header from '../../shared/components/Header'
import { Layout } from '../../shared/components/Layout'
import { useFilteredGames } from '../hooks/useFilteredGames'

interface LibraryGamesProps {
  username: string
  libraryId: string
  queryRef: TransportedQueryRef<any, { libraryId: string }>
}

const LibraryGames = ({ username, libraryId, queryRef }: LibraryGamesProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isOnDetailsPage = (pathname: string) =>
    new RegExp(`^/u/${username}/${libraryId}/Game:[1-9][0-9]*$`).test(pathname)

  const { data, error } = useReadQuery(queryRef)

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

  const games = useFilteredGames(
    (data?.library?.games?.filter((g) => g) as Array<Game>) ?? [],
  )

  if (error) {
    console.error(error, data)
  }

  const [trigger] = useNavigateInGrid()
  const handleScrollTop = () => {
    trigger(0, 0)
  }

  const [isRightDrawerOpen, setRightDrawerOpen] = useState(
    searchParams.get('showFilterPane') === 'true',
  )
  const [isFiltersInDrawer, setFiltersInDrawer] = useState(
    searchParams.get('showFilterPane') === 'true',
  )

  useEffect(() => {
    const filterPaneOpen = searchParams.get('showFilterPane') === 'true'
    setRightDrawerOpen(filterPaneOpen)
    setFiltersInDrawer(filterPaneOpen)
  }, [searchParams])

  const handleClose = useCallback(() => {
    router.push(`/u/${username}/${libraryId}`)
    setRightDrawerOpen(false)
    setFiltersInDrawer(false)
  }, [router, username, libraryId])

  const handleSelection = useCallback(
    (evt: any, game: Game) => {
      router.push(`/u/${username}/${libraryId}/${game.id}`)
      setRightDrawerOpen(true)
      setFiltersInDrawer(false)
    },
    [router, username, libraryId],
  )

  const handleOpenFilter = () => {
    router.push(`/u/${username}/${libraryId}?showFilterPane=true`)
    setRightDrawerOpen(true)
    setFiltersInDrawer(true)
  }

  return (
    <Layout
      title={
        <Header>
          <Typography variant="h1">My Games</Typography>
          <Typography variant="subtitle1">
            <span>{games.length}</span>&nbsp;games in library
          </Typography>
          <Box
            sx={(theme) => ({
              display: 'flex',
              position: 'absolute',
              flex: 1,
              top: theme.spacing(3),
              right: theme.spacing(3),
              zIndex: 1200,
              [theme.breakpoints.down('lg')]: {
                top: theme.spacing(2),
                right: theme.spacing(2),
                zIndex: 1101,
              },
            })}
          >
            <IconButton
              aria-label="Open filter drawer"
              onClick={handleOpenFilter}
              name="open-filter-drawer"
            >
              <FilterAlt />
            </IconButton>
          </Box>
        </Header>
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
