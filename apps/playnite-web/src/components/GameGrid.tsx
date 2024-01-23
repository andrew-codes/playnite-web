import {
  Unstable_Grid2 as Grid,
  Theme,
  styled,
  useMediaQuery,
} from '@mui/material'
import { useFetcher } from '@remix-run/react'
import _ from 'lodash'
import React, {
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import useDimensions from 'react-use-dimensions'
import { getDeviceType } from '../api/client/state/layoutSlice'
import type { Game } from '../api/playnite/types'

const { chunk, debounce, groupBy, stubTrue } = _

const scrollReducer = (state, action) => {
  switch (action.type) {
    case 'VIEWPORT_DIMENSIONS_CHANGED':
      return {
        ...state,
        dimension: action.payload,
      }

    case 'SCROLLED':
      return {
        ...state,
        currentScroll: action.payload,
        pageNumber: Math.max(
          Math.ceil((action.payload * 1.5) / state.dimension),
          state.pageNumber,
        ),
      }

    default:
      return state
  }
}

const Viewport = styled('div')<{
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' | null
}>(({ deviceType, theme }) => ({
  display: 'flex',
  width: '100%',
  height: 'calc(100vh - 32px - 48px)',
  scrollSnapType: deviceType === 'desktop' ? 'y mandatory' : 'x mandatory',
  overflowX: deviceType === 'desktop' ? 'hidden' : 'scroll',
  overflowY: deviceType === 'desktop' ? 'scroll' : 'hidden',
  scrollBehavior: 'smooth',
  flexDirection: 'row',

  '&::-webkit-scrollbar':
    deviceType === 'desktop'
      ? {}
      : {
          display: 'none',
        },
}))

const GamePages = styled('div')<{
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' | null
  length: number
}>(({ deviceType, theme, length }) => ({
  width: deviceType === 'desktop' ? 'initial' : `calc(100vw * ${length})`,
  height: deviceType === 'desktop' ? `calc(100vh * ${length})` : 'unset',
  display: 'flex',
  flexDirection: deviceType === 'desktop' ? 'column' : 'row',

  '> * ': {
    width: deviceType === 'desktop' ? '100%' : '100vw',
    scrollSnapAlign: deviceType === 'desktop' ? 'initial' : 'start',
    marginRight: deviceType === 'desktop' ? 'unset' : '8px !important',
    marginBottom: deviceType === 'desktop' ? '8px !important' : 'unset',
  },
}))

const GameGrid: FC<{
  games: Game[]
  Game: FC<{
    cover: string
    game: Game[]
    height: number
    width: number
    onActivate: (evt: React.SyntheticEvent, id: string) => void
  }>
  onFilter?: (game: Game) => boolean
  onPageChange?: (pageNumber: number) => void
}> = ({ games, Game, onFilter = stubTrue, onPageChange = stubTrue }) => {
  const deviceType = useSelector(getDeviceType)
  console.log(deviceType)

  const layoutDirection =
    deviceType === 'mobile' || deviceType === 'tablet' ? 'column' : 'row'

  const [ref, { height, width }] = useDimensions()
  useEffect(() => {
    dispatch({
      type: 'VIEWPORT_DIMENSIONS_CHANGED',
      payload: deviceType !== 'desktop' ? width : height,
    })
  }, [deviceType, height, width])

  const [{ pageNumber }, dispatch] = useReducer(scrollReducer, {
    pageNumber: 1,
    currentScroll: 0,
    dimension: 0,
  })
  useEffect(() => {
    onPageChange(pageNumber)
  }, [pageNumber, onPageChange])

  const isTickingRef = useRef(false)
  const updateScroll = useCallback(
    debounce(
      (evt) =>
        dispatch({
          type: 'SCROLLED',
          payload:
            deviceType !== 'desktop'
              ? evt.target.scrollLeft
              : evt.target.scrollTop,
        }),
      120,
    ),
    [deviceType],
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

  const isTabletSized = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between('tablet', 'desktop'),
  )
  const isPhoneSized = useMediaQuery((theme: Theme) =>
    theme.breakpoints.between('phone', 'tablet'),
  )

  const { columns, columnWidth, rows, rowHeight } = useMemo(() => {
    let columns
    if (!width || !height) {
      columns = 8
      if (isPhoneSized) {
        columns = 2
      }
      if (isTabletSized) {
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
  }, [width, height, isTabletSized, isPhoneSized])

  const perPage = useMemo(() => {
    return rows * columns
  }, [rows, columns])

  const normalizedGames = useMemo<Game[][]>(() => {
    const filteredGames = games.filter(onFilter)
    return Object.values(groupBy(filteredGames, 'sortName')) as Game[][]
  }, [games, onFilter, pageNumber, perPage])
  const allPages = useMemo(
    () => chunk(normalizedGames, perPage),
    [normalizedGames, perPage],
  )
  const pagedGrids = useMemo(
    () =>
      allPages
        .slice(0, pageNumber + 1)
        .map((gamesPerPage: Game[][]) => chunk(gamesPerPage, columns)),
    [allPages, columns, pageNumber],
  )

  const fetcher = useFetcher()
  const handleActivate = useCallback(
    (evt: SyntheticEvent, id: string) => {
      fetcher.submit({ id }, { method: 'post', action: '/activate' })
    },
    [fetcher.submit],
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
      <Viewport ref={ref} onScroll={handleScroll} deviceType={deviceType}>
        <GamePages length={allPages.length - 1} deviceType={deviceType}>
          {pagedGrids.map((gameRows: Game[][][], pageIndex: number) => (
            <Grid
              key={pageIndex}
              container
              direction={layoutDirection}
              spacing={2}
            >
              {gameRows.map((games: Game[][], rowIndex: number) => (
                <Grid
                  container
                  key={rowIndex}
                  direction="row"
                  spacing={2}
                  style={{
                    width: '100%',
                  }}
                >
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
                        onActivate={handleActivate}
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
