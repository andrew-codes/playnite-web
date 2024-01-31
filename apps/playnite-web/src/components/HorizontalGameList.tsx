import { useMediaQuery, useTheme } from '@mui/material'
import { useFetcher } from '@remix-run/react'
import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import * as windowed from 'react-window'
import type { IGame, IList } from '../domain/types'
import GameFigure from './GameFigure'

const { FixedSizeList: List } = windowed

const GameListItem: FC<{ data: IGame[]; index: number; style: any }> = ({
  data,
  index,
  style,
}) => {
  const game = data[index]
  console.log(style.width)
  return (
    <GameFigure
      key={game.oid.asString}
      game={game}
      primaryText={game.name}
      secondaryText={game.series.join(',')}
      style={style}
    />
  )
}

const HorizontalGameList: FC<{
  games: IList<IGame>
}> = ({ games }) => {
  const fetcher = useFetcher()
  const playGame = useCallback(
    (evt: SyntheticEvent, id: string) => {
      fetcher.submit({ id }, { method: 'post', action: '/activate' })
    },
    [fetcher],
  )

  const testGames = games.items.concat(games.items.slice(0, 4))

  const theme = useTheme()
  const isXxl = useMediaQuery(theme.breakpoints.up('xxl'))
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const isXxs = useMediaQuery(theme.breakpoints.down('xxs'))
  const itemSize = useMemo(() => {
    if (isXxl) return 240
    if (isXl) return 240
    if (isLg) return 240
    if (isMd) return 240
    if (isSm) return 240
    if (isXs) return 240
    return 168
  }, [isXxl, isXl, isLg, isMd, isSm, isXs])
  const width = useMemo(() => {
    if (isXxl) return 1440
    if (isXl) return 1024
    if (isMd) return 960
    if (isSm) return 736
    if (isXs) return 544
    return 342
  }, [isXxl, isXl, isLg, isMd, isSm, isXs])
  const height = useMemo(() => {
    if (isXxl) return 286
    if (isXl) return 286
    if (isLg) return 286
    if (isMd) return 286
    if (isSm) return 286
    if (isXs) return 286
    return 202
  }, [isXxl, isXl, isLg, isMd, isSm, isXs])

  return (
    <List
      height={height}
      itemCount={testGames.length}
      itemData={testGames}
      itemSize={itemSize}
      layout="horizontal"
      width={width}
    >
      {GameListItem}
    </List>
  )
}

export default HorizontalGameList
