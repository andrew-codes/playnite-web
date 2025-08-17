import { Box } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import useDimensions from 'react-use-dimensions'
import { Game } from '../../.generated/types.generated'
import GameGrid from '../components/GameGrid'
import useThemeWidth from './useThemeWidth'

const MyLibrary: FC<{
  games: Array<Game>
  onSelect?: (evt, game: Game) => void
}> = ({ games, onSelect }) => {
  const width = useThemeWidth()

  const [ref, dims] = useDimensions({ liveMeasure: true })
  const [windowHeight, setWindowHeight] = useState(0)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    function resizeListener(evt: UIEvent) {
      setWindowHeight((evt.target as Window)?.document.body.offsetHeight)
    }
    window.addEventListener('resize', resizeListener)
    setWindowHeight(window.document.body.offsetHeight)

    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [])
  useEffect(() => {
    setHeight((windowHeight ?? 0) - dims.y)
  }, [dims, windowHeight])

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
        [theme.breakpoints.up('xl')]: {
          width: `${width}px`,
        },
      })}
    >
      <GameGrid games={games} height={windowHeight} onSelect={onSelect} />
    </Box>
  )
}

export default MyLibrary
