'use client'

import { Box, GlobalStyles } from '@mui/material'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Game } from '../../../../.generated/types.generated'
import { useFilteredGames } from '../hooks/useFilteredGames'
import GameGrid from './VirtualizedGameGrid'

const EmbeddableGames: FC<{
  username: string
  libraryId: string
  games: Array<Game>
}> = ({ username, libraryId, games }) => {
  const filteredGames = useFilteredGames(
    (games.filter((g) => g) as Array<Game>) ?? [],
  )

  const navigate = useNavigate()
  const handleSelectGame = useCallback(
    (evt, game) => {
      console.log('EmbeddableGames: Navigating to game', game.id)
      navigate(`/game/${game.id}`)
    },
    [navigate],
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
            games={filteredGames}
            onSelect={handleSelectGame}
          />
        )}
      </Box>
    </>
  )
}

export default EmbeddableGames
