import { Box } from '@mui/material'
import { FC } from 'react'
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

  return (
    <Box
      ref={ref}
      sx={(theme) => ({
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
      <GameGrid games={games} height={dims.height ?? 0} onSelect={onSelect} />
    </Box>
  )
}

export default MyLibrary
