import { styled, Typography, useMediaQuery, useTheme } from '@mui/material'
import { createRef, FC, useEffect, useMemo } from 'react'
import { Grid } from 'react-window'
import { Game } from '../../.generated/types.generated'
import GameFigure from './GameFigure'
import { useNavigateInGrid } from './NavigateInGrid/context'

const GridRoot = styled('div')``

const GameGrid: FC<{
  games: Array<Game>
  onSelect?: (evt, game: Game) => void
  width: number
}> = ({ games, onSelect, width }) => {
  const theme = useTheme()
  const isXxl = useMediaQuery(theme.breakpoints.up('xxl'))
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const useMoreSpacing = isSm

  const columns = useMemo(() => {
    if (isXxl) return 9
    if (isXl) return 6
    if (isLg) return 4
    if (isMd) return 3
    if (isSm) return 2
    if (isXs) return 2
    return 2
  }, [isXxl, isXl, isLg, isMd, isSm, isXs])
  const horizontalGap = useMoreSpacing ? 24 : 8
  const columnWidth = useMemo(() => {
    return Math.floor((width - columns) / columns)
  }, [width, columns])
  const rowHeight = useMemo(() => {
    return columnWidth + 64
  }, [columnWidth])
  const rowCount = Math.ceil(games.length / columns)

  const gridRef = createRef<{
    scrollToItem: (params: { rowIndex: number; columnIndex: number }) => void
  }>()
  const [_, subscribe] = useNavigateInGrid()
  useEffect(() => {
    subscribe((rowIndex, columnIndex) => {
      gridRef.current?.scrollToItem({ rowIndex: 0, columnIndex: 0 })
    })
  }, [])

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const game = games[rowIndex * columns + columnIndex]
    if (!game) {
      return null
    }

    return (
      <div
        style={{
          ...style,
          left: style.left,
          width: style.width,
          ...(style.height && { height: style?.height }),
        }}
      >
        <GameFigure
          game={game}
          height={`${rowHeight}px`}
          width={`${style.width - horizontalGap}px`}
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
            {game.primaryRelease?.title || 'Unknown Game'}
          </Typography>
        </GameFigure>
      </div>
    )
  }

  return (
    <GridRoot data-test="GameGrid">
      <Grid<{ games: Array<Game> }>
        cellProps={{ games }}
        cellComponent={Cell}
        columnCount={columns}
        columnWidth={columnWidth}
        rowCount={rowCount}
        rowHeight={rowHeight}
      />
    </GridRoot>
  )
}

export default GameGrid
