import { ImageList, styled, useMediaQuery, useTheme } from '@mui/material'
import { useFetcher } from '@remix-run/react'
import _ from 'lodash'
import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import type { IGame, IList, Match } from '../domain/types'
import GameFigure from './GameFigure'

const { chunk } = _

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
`

const GameGrid: FC<{
  games: IList<Match<IGame>>
}> = ({ games }) => {
  const fetcher = useFetcher()
  const playGame = useCallback(
    (evt: SyntheticEvent, id: string) => {
      fetcher.submit({ id }, { method: 'post', action: '/activate' })
    },
    [fetcher],
  )

  const theme = useTheme()
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))

  const columnWidth = useMemo(() => {
    if (isXl) return 240
    if (isLg) return 240
    if (isMd) return 232
    if (isSm) return 200
    if (isXs) return 184
    return 168
  }, [isXl, isLg, isMd, isSm, isXs])
  const rowHeight = useMemo(() => {
    return columnWidth + 48
  }, [columnWidth])
  const columns = useMemo(() => {
    if (isXl) return 5
    if (isLg) return 4
    if (isMd) return 3
    if (isSm) return 2
    if (isXs) return 2
    return 2
  }, [isXl, isLg, isMd, isSm, isXs])

  return (
    <>
      <ImageListWithoutOverflow rowHeight={rowHeight} cols={columns}>
        {games.items.map((game, gameIndex) => (
          <GameFigure
            noDefer={gameIndex <= 15}
            game={game}
            primaryText={game.name}
            secondaryText={game.name}
            width={`${columnWidth - 16}px`}
            key={game.oid.asString}
          />
        ))}
      </ImageListWithoutOverflow>
    </>
  )
}

export default GameGrid
