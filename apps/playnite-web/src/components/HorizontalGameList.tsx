import { useFetcher } from '@remix-run/react'
import { FC, SyntheticEvent, useCallback } from 'react'
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

  return (
    <List
      height={286}
      itemCount={games.items.length}
      itemData={games.items}
      itemSize={240}
      layout="horizontal"
      width={1200}
    >
      {GameListItem}
    </List>
  )
}

export default HorizontalGameList
