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
  const [heightBottomOffset, setHeightBottomOffset] = useState<null | number>(
    null,
  )
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    function resize(win: Window) {
      if (!dims.y || !dims.x || !dims.right || !dims.bottom) {
        return
      }
      setHeight(win.document.body.offsetHeight - dims.y)
      setHeightBottomOffset(win.document.body.offsetHeight - dims.bottom)
      setWidth(
        win.document.body.offsetWidth -
          dims.x -
          (win.document.body.offsetWidth - dims.right),
      )
    }
    function resizeListener(evt: UIEvent) {
      resize(evt.target as Window)
    }

    if (!height && !width) {
      resize(window)
    }

    window.addEventListener('resize', resizeListener)

    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [dims.y, dims.x, dims.right, dims.bottom])

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
