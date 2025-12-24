'use client'

import { useQuery } from '@apollo/client/react'
import { Box, GlobalStyles } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Game, Library } from '../../../../.generated/types.generated'
import { useFilteredGames } from '../hooks/useFilteredGames'
import { AllGamesQuery } from '../queries'
import GameGrid from './VirtualizedGameGrid'

const MyLibrary: FC<{
  username: string
  libraryId: string
}> = ({ username, libraryId }) => {
  const { data, error } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })
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

  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // TODO: Remove magic numbers
        setWidth(Math.max(0, entry.contentRect.width - 15))
        setHeight(Math.min(window.innerHeight - 176, entry.contentRect.height))
      }
    })

    resizeObserver.observe(ref.current)

    const rect = ref.current.getBoundingClientRect()

    setWidth(Math.max(0, rect.width))
    setHeight(Math.max(0, rect.height))

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <GlobalStyles styles={{ body: { overflowY: 'hidden' } }} />
      <Box
        ref={ref}
        sx={(theme) => ({
          flex: 1,
          flexGrow: 1,
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          margin: '0 auto',
        })}
      >
        {width && height && (
          <GameGrid
            height={height}
            width={width}
            games={games}
            onSelect={handleSelectGame}
          />
        )}
      </Box>
    </>
  )
}

export default MyLibrary
