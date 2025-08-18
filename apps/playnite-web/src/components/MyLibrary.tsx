import { Box } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import useDimensions from 'react-use-dimensions'
import { Game } from '../../.generated/types.generated'
import GameGrid from '../components/GameGrid'

const MyLibrary: FC<{
  games: Array<Game>
  onSelect?: (evt, game: Game) => void
}> = ({ games, onSelect }) => {
  const [ref, dims] = useDimensions({ liveMeasure: true })
  const [windowHeight, setWindowHeight] = useState(0)
  const [heightBottomOffset, setHeightBottomOffset] = useState<null | number>(
    null,
  )
  const [height, setHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    function resizeListener(evt: UIEvent) {
      setWindowHeight((evt.target as Window)?.document.body.offsetHeight)
      setWindowWidth((evt.target as Window)?.document.body.offsetWidth)
    }
    window.addEventListener('resize', resizeListener)
    setWindowHeight(window.document.body.offsetHeight)
    setWindowWidth(window.document.body.offsetWidth)

    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [])
  useEffect(() => {
    if (heightBottomOffset !== null || windowHeight === 0 || !dims?.bottom) {
      return
    }
    setHeightBottomOffset(windowHeight - dims.bottom)
  }, [windowHeight, dims.bottom])
  useEffect(() => {
    if (!dims.y || !dims.x || !dims.right) {
      return
    }
    setHeight((windowHeight ?? 0) - dims.y)
    setWidth((windowWidth ?? 0) - dims.x - (windowWidth - dims.right))
  }, [dims.y, windowHeight, windowWidth, dims.x])

  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        flex: 1,
        flexGrow: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        margin: '0 auto',
        [theme.breakpoints.up('lg')]: {
          overflowY: 'auto',
        },
      })}
    >
      {height > 0 && width > 0 && heightBottomOffset !== null && (
        <GameGrid
          games={games}
          height={height - heightBottomOffset}
          onSelect={onSelect}
          width={width}
        />
      )}
    </Box>
  )
}

export default MyLibrary
