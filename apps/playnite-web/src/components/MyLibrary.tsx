import { Box } from '@mui/material'
import { FC, useEffect, useRef, useState } from 'react'
import { Game } from '../../.generated/types.generated'
import GameGrid from './GameGrid'

const MyLibrary: FC<{
  games: Array<Game>
  onSelect?: (evt, game: Game) => void
}> = ({ games, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 1366 })

  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: elementWidth } = entry.contentRect
        setDimensions({
          width: Math.max(0, elementWidth),
        })
      }
    })

    resizeObserver.observe(ref.current)

    const rect = ref.current.getBoundingClientRect()
    const initialWidth = rect.width

    setDimensions({
      width: Math.max(0, initialWidth),
    })

    return () => {
      resizeObserver.disconnect()
    }
  }, [isClient])

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
      <GameGrid games={games} onSelect={onSelect} width={dimensions.width} />
    </Box>
  )
}

export default MyLibrary
