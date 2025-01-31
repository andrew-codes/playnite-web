import { Typography, useMediaQuery, useTheme } from '@mui/material'
import { createRef, FC, forwardRef, useMemo } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import { Game } from '../../.generated/types.generated'
import GameFigure from './GameFigure'
import { useNavigateInGrid } from './NavigateInGrid/context'
import useThemeWidth from './useThemeWidth'

const GameGrid: FC<{
  games: Array<Game>
  height: number | string
  onSelect?: (evt, game: Game) => void
}> = ({ games, height, onSelect }) => {
  const theme = useTheme()
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const useMoreSpacing = useMediaQuery(theme.breakpoints.down('lg')) && isSm
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
  const rowCount = Math.ceil(games.length / columns)

  const gridRef = createRef<{
    scrollToItem: (params: { rowIndex: number; columnIndex: number }) => void
  }>()
  const [_, subscribe] = useNavigateInGrid()
  subscribe((rowIndex, columnIndex) => {
    gridRef.current?.scrollToItem({ rowIndex: 0, columnIndex: 0 })
  })

  const horizontalGutter = useMoreSpacing ? 16 : 8
  const verticalGutter = 6
  const innerElementType = forwardRef<HTMLDivElement, { style: any }>(
    ({ style, ...rest }, ref) => (
      <div
        ref={ref}
        style={{
          ...style,
          paddingLeft: horizontalGutter,
          paddingTop: verticalGutter,
        }}
        {...rest}
      />
    ),
  )

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const game = games[rowIndex * columns + columnIndex]
    if (!game) {
      return null
    }

    return (
      <div
        style={{
          ...style,
          left: style.left + horizontalGutter,
          top: style.top + verticalGutter,
          width: style.width - horizontalGutter,
          height: style.height - verticalGutter,
        }}
      >
        <GameFigure
          game={game}
          height={`${rowHeight}px`}
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
        </GameFigure>
      </div>
    )
  }

  return (
    <Grid
      ref={gridRef}
      columnCount={columns}
      columnWidth={columnWidth + horizontalGutter}
      height={height}
      innerElementType={innerElementType}
      rowCount={rowCount}
      rowHeight={rowHeight + verticalGutter}
      width={width + horizontalGutter * 2}
    >
      {Cell}
    </Grid>
  )
}

export default GameGrid
