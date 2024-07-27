import {
  ImageList,
  ImageListItem,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { FC, useMemo } from 'react'
import { Game } from '../server/graphql/types.generated'
import GameFigure from './GameFigure'
import useThemeWidth from './useThemeWidth'

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
  margin-top: 0;
`

const GameGrid: FC<{
  games: Array<Game>
  noDeferCount: number
  onSelect?: (evt, game: Game) => void
}> = ({ games, noDeferCount, onSelect }) => {
  const theme = useTheme()
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const columns = useMemo(() => {
    if (isXl) return 5
    if (isLg) return 4
    if (isMd) return 3
    if (isSm) return 2
    if (isXs) return 2
    return 2
  }, [isXl, isLg, isMd, isSm, isXs])
  const width = useThemeWidth()
  const columnWidth = useMemo(() => {
    return Math.floor((width - columns * 16) / columns)
  }, [width, columns])
  const rowHeight = useMemo(() => {
    return columnWidth + 96
  }, [columnWidth])

  return (
    <>
      <ImageListWithoutOverflow rowHeight={rowHeight} cols={columns}>
        {games.map((game, gameIndex) => (
          <ImageListItem
            key={game.id}
            sx={(theme) => ({
              alignItems: 'center',
            })}
          >
            <GameFigure
              game={game}
              height={`${rowHeight}px`}
              noDefer={gameIndex <= noDeferCount}
              width={`calc(${columnWidth}px)`}
              onSelect={(evt) => {
                onSelect?.(evt, game)
              }}
            >
              <Typography
                variant="caption"
                component="figcaption"
                sx={{
                  fontWeight: 'bold',
                  textWrap: 'balance',
                  lineHeight: '1.5',
                  textOverflow: 'ellipsis',
                  overflowY: 'hidden',
                  maxHeight: '4rem',
                  lineClamp: '2',
                  fontSize: '15px',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical ',
                }}
              >
                {game.name}
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{
                  textWrap: 'balance',
                  lineHeight: '1',
                  textOverflow: 'ellipsis',
                  overflowY: 'hidden',
                  maxHeight: '2rem',
                  lineClamp: '1',
                  fontSize: '13px',
                  display: '-webkit-box',
                  WebkitLineClamp: '1',
                  WebkitBoxOrient: 'vertical ',
                }}
              >
                {/* {game.completionStatus.toString()} */}
              </Typography>
            </GameFigure>
          </ImageListItem>
        ))}
      </ImageListWithoutOverflow>
    </>
  )
}

export default GameGrid
