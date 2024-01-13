import { Unstable_Grid2 as Grid, styled } from '@mui/material'
import _ from 'lodash'
import { FC, useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import useDimensions from 'react-use-dimensions'
import type { Game } from '../api/server/playnite/types'

const { chunk, debounce, groupBy, stubTrue } = _

const scrollReducer = (state, action) => {
  console.log('dispatched', action.type, action.payload)
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
  columns: number
  games: Game[]
  Game: FC<{
    cover: string
    game: Game[]
  }>
  rows: number
  onFilter?: (game: Game) => boolean
  onPageChange?: (pageNumber: number) => void
}> = ({
  games,
  rows,
  columns,
  Game,
  onFilter = stubTrue,
  onPageChange = stubTrue,
}) => {
  const [ref, { width }] = useDimensions()
  useEffect(() => {
    dispatch({ type: 'PAGE_WIDTH_CHANGED', payload: width })
  }, [width])

  const [{ pageNumber }, dispatch] = useReducer(scrollReducer, {
    pageNumber: 1,
    currentScroll: 0,
    pageWidth: 0,
  })
  useEffect(() => {
    console.log(pageNumber)
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
                      cover={`coverArt/${game[0].oid.type}:${game[0].oid.id}`}
                      game={game}
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        ))}
      </GamePages>
    </Viewport>
  )
}

export default GameGrid
