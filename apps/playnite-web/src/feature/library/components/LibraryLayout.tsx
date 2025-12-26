'use client'

import { useQuery } from '@apollo/client/react'
import { FilterAlt } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Library } from '../../../../.generated/types.generated'
import { setCompletionStates } from '../../../api/client/state/completionStatesSlice'
import { useMe } from '../../account/hooks/me'
import AuthenticatedNavigation from '../../mainNavigation/components/AuthenticatedNavigation'
import LibrariesNavigation from '../../mainNavigation/components/LibrariesNavigation'
import LibraryNavigation from '../../mainNavigation/components/LibraryNavigation'
import MainNavigation from '../../mainNavigation/components/MainNavigation'
import IconButton from '../../shared/components/IconButton'
import { Layout } from '../../shared/components/Layout'
import { AllGamesQuery } from '../queries'

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

  const { data, error } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })

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
      navs={navs}
    >
      {children}
    </Layout>
  )
}

export { LibraryLayout }
