import {
  ImageList,
  ImageListItem,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { FC, useMemo } from 'react'
import type { IGame, IList, Match } from '../domain/types'
import GameFigure from './GameFigure'
import useThemeWidth from './useThemeWidth'

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
  margin-top: 0;
`

const HorizontalGameList: FC<{
  games: IList<Match<IGame>>
  noDeferCount: number
  onSelect?: (evt, game: IGame) => void
}> = ({ games, noDeferCount, onSelect }) => {
  const theme = useTheme()
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const columnsOnScreen = useMemo(() => {
    if (isXl) return 5
    if (isLg) return 4
    if (isMd) return 3
    if (isSm) return 2
    if (isXs) return 2
    return 2
  }, [isXl, isLg, isMd, isSm, isXs])
  const width = useThemeWidth()
  const columnWidth = useMemo(() => {
    return Math.floor((width - columnsOnScreen * 16) / columnsOnScreen)
  }, [width, columnsOnScreen])
  const rowHeight = useMemo(() => {
    return columnWidth + 64
  }, [columnWidth])

  const columns = useMemo(() => {
    return games.items.filter((game) => game.matches).length
  }, [games.items])

  return (
    <>
      <ImageListWithoutOverflow rowHeight={rowHeight} cols={columns}>
        {games.items.map((game, gameIndex) => (
          <ImageListItem
            key={game.id.toString()}
            sx={(theme) => ({
              ...(!game.matches ? { display: 'none' } : {}),
              alignItems: 'center',
              margin: '0 16px',
            })}
          >
            <GameFigure
              game={game}
              height={`${rowHeight}px`}
              noDefer={gameIndex <= noDeferCount}
              onSelect={onSelect}
              width={`calc(${columnWidth}px)`}
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
                {game.toString()}
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
                {game.developers.map((d) => d.name).join(', ')}
              </Typography>
            </GameFigure>
          </ImageListItem>
        ))}
      </ImageListWithoutOverflow>
    </>
  )
}

export default HorizontalGameList
