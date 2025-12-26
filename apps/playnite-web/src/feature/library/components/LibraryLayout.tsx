'use client'

import { useQuery } from '@apollo/client/react'
import { FilterAlt } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Game, Library } from '../../../../.generated/types.generated'
import { setCompletionStates } from '../../../api/client/state/completionStatesSlice'
import LibrariesNavigation from '../../../components/Navigation/LibrariesNavigation'
import LibraryNavigation from '../../../components/Navigation/LibraryNavigation'
import MainNavigation from '../../../components/Navigation/MainNavigation'
import Header from '../../shared/components/Header'
import IconButton from '../../shared/components/IconButton'
import { Layout } from '../../shared/components/Layout'
import { AllGamesQuery } from '../queries'

interface LibraryGamesProps {
  username: string
  libraryId: string
  title: string
  children: React.ReactNode
}

const LibraryLayout = ({
  username,
  libraryId,
  title,
  children,
}: LibraryGamesProps) => {
  const router = useRouter()

  const { data, error } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })

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

  const games = (data?.library?.games?.filter((g) => g) as Array<Game>) ?? []

  if (error) {
    console.error(error, data)
  }

  const handleOpenFilter = () => {
    router.push(`/u/${username}/${libraryId}/filters`)
  }

  return (
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
      title={
        <Header>
          <Typography variant="h1">
            {title} - {data?.library?.name}
          </Typography>
          <Typography variant="subtitle1">
            <span>{games.length}</span>&nbsp;games in library
          </Typography>
        </Header>
      }
      navs={[LibraryNavigation, LibrariesNavigation, MainNavigation]}
    >
      {children}
    </Layout>
  )
}

export { LibraryLayout }
