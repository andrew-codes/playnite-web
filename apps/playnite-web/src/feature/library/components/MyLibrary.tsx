'use client'

import { QueryRef, useReadQuery } from '@apollo/client/react'
import { Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { Game, Library } from '../../../../.generated/types.generated'
import { useFilteredGames } from '../hooks/useFilteredGames'
import GameGrid from './VirtualizedGameGrid'

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

  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: elementWidth } = entry.contentRect
        setWidth(Math.max(0, elementWidth - 15))
      }
    })

    resizeObserver.observe(ref.current)

    const rect = ref.current.getBoundingClientRect()
    const initialWidth = rect.width

    setWidth(Math.max(0, initialWidth))

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <Box
      ref={ref}
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
      {width && (
        <GameGrid width={width} games={games} onSelect={handleSelectGame} />
      )}
    </Box>
  )
}

export default MyLibrary
