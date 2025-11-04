'use client'

import { QueryRef, useReadQuery } from '@apollo/client/react'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FC, useCallback } from 'react'
import { Game, Library } from '../../../../.generated/types.generated'
import { useFilteredGames } from '../hooks/useFilteredGames'
import GameGrid from './GameGrid'

const MyLibrary: FC<{
  username: string
  libraryId: string
  queryRef: QueryRef<{ library: Library }, { libraryId: string }>
}> = ({ username, libraryId, queryRef }) => {
  const { data, error } = useReadQuery(queryRef)
  const games = useFilteredGames(
    (data?.library?.games?.filter((g) => g) as Array<Game>) ?? [],
  )
  if (error) {
    console.error(error, data)
  }

  const router = useRouter()
  const handleSelectGame = useCallback(
    (evt, game) => {
      router.push(`/u/${username}/${libraryId}/game/${game.id}`)
    },
    [router, username, libraryId],
  )

  return (
    <Box
      sx={(theme) => ({
        flex: 1,
        flexGrow: 1,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: '0 auto',
      })}
    >
      <GameGrid games={games} onSelect={handleSelectGame} />
    </Box>
  )
}

export default MyLibrary
