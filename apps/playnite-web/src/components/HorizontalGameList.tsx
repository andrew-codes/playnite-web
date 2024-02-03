import { useMediaQuery, useTheme } from '@mui/material'
import { useFetcher } from '@remix-run/react'
import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import * as windowed from 'react-window'
import type { IGame, IList } from '../domain/types'
import GameFigure from './GameFigure'
import useThemeWidth from './useThemeWidth'

const { FixedSizeList: List } = windowed

const GameListItem: FC<{ data: IGame[]; index: number; style: any }> = ({
  data,
  index,
  style,
}) => {
  const game = data[index]
  return (
    <GameFigure
      key={game.oid.asString}
      game={game}
      primaryText={game.name}
      secondaryText={game.name}
      style={style}
      width={`${style.width}px`}
      height={style.height}
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

  const theme = useTheme()
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.up('md'))
  const isSm = useMediaQuery(theme.breakpoints.up('sm'))
  const isXs = useMediaQuery(theme.breakpoints.up('xs'))
  const itemSize = useMemo(() => {
    if (isXl) return 240
    if (isLg) return 240
    if (isMd) return 232
    if (isSm) return 232
    if (isXs) return 196
    return 168
  }, [isXl, isLg, isMd, isSm, isXs])

  const width = useThemeWidth()
  const height = useMemo(() => {
    if (isXl) return 286
    if (isLg) return 286
    if (isMd) return 286
    if (isSm) return 286
    if (isXs) return 286
    return 202
  }, [isXl, isLg, isMd, isSm, isXs])

  return (
    <List
      height={height}
      itemCount={games.items.length}
      itemData={games.items}
      itemSize={itemSize}
      layout="horizontal"
      width={width}
    >
      {GameListItem}
    </List>
  )
}

export default HorizontalGameList
