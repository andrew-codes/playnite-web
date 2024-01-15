import {
  Unstable_Grid2 as Grid,
  Theme,
  styled,
  useMediaQuery,
} from '@mui/material'
import _ from 'lodash'
import { FC, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { Helmet } from 'react-helmet'
import useDimensions from 'react-use-dimensions'
import type { Game } from '../api/server/playnite/types'

const { chunk, debounce, groupBy, stubTrue } = _

const scrollReducer = (state, action) => {
  switch (action.type) {
    case 'PAGE_WIDTH_CHANGED':
      return {
        ...state,
        pageWidth: action.payload,
      }

    case 'SCROLLED':
      return {
        ...state,
        currentScroll: action.payload,
        pageNumber: Math.max(
          Math.ceil((action.payload * 1.5) / state.pageWidth),
          state.pageNumber,
        ),
      }

    default:
      return state
  }
}

const Viewport = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flex: 1,
  scrollSnapType: 'x mandatory',
  overflowX: 'scroll',
  overflowY: 'hidden',
  scrollBehavior: 'smooth',
  flexDirection: 'row',

  '&::-webkit-scrollbar': {
    display: 'none',
  },
}))

const GamePages = styled('div')<{ length: number }>(({ theme, length }) => ({
  width: `calc(100vw * ${length})`,
  display: 'flex',
  flexDirection: 'row',

  '> * ': {
    width: '100vw',
    scrollSnapAlign: 'start',
    marginRight: '8px !important',
  },
}))

const GameGrid: FC<{
  games: Game[]
  Game: FC<{
    cover: string
    game: Game[]
    height: number
    width: number
  }>
  onFilter?: (game: Game) => boolean
  onPageChange?: (pageNumber: number) => void
}> = ({ games, Game, onFilter = stubTrue, onPageChange = stubTrue }) => {
  const [ref, { height, width }] = useDimensions()
  useEffect(() => {
    dispatch({ type: 'PAGE_WIDTH_CHANGED', payload: width })
  }, [width])

  const [{ pageNumber }, dispatch] = useReducer(scrollReducer, {
    pageNumber: 1,
    currentScroll: 0,
    pageWidth: 0,
  })
  useEffect(() => {
    onPageChange(pageNumber)
  }, [pageNumber, onPageChange])

  const isTickingRef = useRef(false)
  const updateScroll = useCallback(
    debounce(
      (evt) => dispatch({ type: 'SCROLLED', payload: evt.target.scrollLeft }),
      120,
    ),
    [],
  )
  const handleScroll = useCallback(
    (evt) => {
      if (!isTickingRef.current) {
        window.requestAnimationFrame(() => {
          isTickingRef.current = false
          updateScroll(evt)
        })
        isTickingRef.current = true
      }
    },
    [updateScroll],
  )

  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between('tablet', 'desktop'),
  )
  const isPhone = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between('phone', 'tablet'),
  )

  const { columns, columnWidth, rows, rowHeight } = useMemo(() => {
    let columns
    if (!width || !height) {
      columns = 8
      if (isPhone) {
        columns = 2
      }
      if (isTablet) {
        columns = 4
      }
    } else {
      columns = 1
      if (width >= 400) {
        columns = 2
      }
      if (width >= 600) {
        columns = 3
      }
      if (width >= 848) {
        columns = 4
      }
      if (width >= 1280) {
        columns = 6
      }
      if (width >= 1920) {
        columns = 8
      }
    }

    const maxColumnWidth = Math.floor(width / columns) - 16
    const rowHeight = Math.floor((maxColumnWidth * 4) / 3)

    return {
      columns,
      columnWidth: maxColumnWidth,
      rowHeight,
      rows: Math.floor(height / rowHeight),
    }
  }, [width, height, isTablet, isPhone])

  const perPage = useMemo(() => {
    return rows * columns
  }, [rows, columns])
  const normalizedGames = useMemo<Game[][]>(() => {
    const filteredGames = games.filter(onFilter)
    return Object.values(groupBy(filteredGames, 'sortName')).slice(
      0,
      perPage * (pageNumber + 2),
    ) as Game[][]
  }, [games, onFilter, pageNumber, perPage])
  const pagedGrids = useMemo(
    () =>
      chunk(normalizedGames, perPage).map((gamesPerPage: Game[][]) =>
        chunk(gamesPerPage, columns),
      ),
    [normalizedGames, perPage],
  )

  return (
    <>
      <Helmet>
        {pagedGrids.map((gameRows: Game[][][], pageIndex: number) =>
          gameRows.map((games: Game[][], rowIndex: number) =>
            games.map((game: Game[]) => {
              if (pageIndex === 0) {
                return (
                  <link
                    key={`${pageIndex}-${rowIndex}-${game[0].oid.id}`}
                    rel="preload"
                    as="image"
                    href={`gameAsset/cover/${game[0].oid.type}:${game[0].oid.id}`}
                  />
                )
              }
              return (
                <link
                  key={`${pageIndex}-${rowIndex}-${game[0].oid.id}`}
                  rel="prefetch"
                  as="image"
                  href={`gameAsset/cover/${game[0].oid.type}:${game[0].oid.id}`}
                />
              )
            }),
          ),
        )}
      </Helmet>
      <Viewport ref={ref} onScroll={handleScroll}>
        <GamePages length={pagedGrids.length}>
          {pagedGrids.map((gameRows: Game[][][], pageIndex: number) => (
            <Grid key={pageIndex} container direction="column" spacing={2}>
              {gameRows.map((games: Game[][], rowIndex: number) => (
                <Grid container key={rowIndex} direction="row" spacing={2}>
                  {games.map((game: Game[]) => (
                    <Grid
                      tablet={12 / columns}
                      spacing={2}
                      key={game[0].oid.id}
                      style={{ display: 'flex' }}
                    >
                      <Game
                        cover={`gameAsset/cover/${game[0].oid.type}:${game[0].oid.id}`}
                        game={game}
                        height={rowHeight}
                        width={columnWidth}
                      />
                    </Grid>
                  ))}
                </Grid>
              ))}
            </Grid>
          ))}
        </GamePages>
      </Viewport>
    </>
  )
}

export default GameGrid
