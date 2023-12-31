import _ from 'lodash'
import { FC, useMemo } from 'react'
import { styled } from 'styled-components'
import type { Game } from '../api/types'

const { groupBy } = _

const OrderedList = styled.ol<{ width: number }>`
  margin: 0;
  padding: 0;
  width: ${({ width }) => width}px;
`

const ListItem = styled.li<{ width: number }>`
  box-sizing: border-box;
  display: inline-flex;
  height: ${({ width }) => Math.trunc((width / 3) * 4)}px;
  width: ${({ width }) => width}px;
`

const Game = styled.section<{ cover: string }>`
  background-image: url(${({ cover }) => cover});
  background-size: cover;
  border: 1px solid rgb(255, 255, 255);
  display: flex;
  flex: 1;
  margin: 16px 8px;
  padding: 0;
  position: relative;
`

const GameTitle = styled.span`
  color: #fff;
  font-size: 1.5rem;
  left: 10%;
  position: absolute;
  right: 10%;
  text-align: center;
  top: 20%;
`

const GameList: FC<{ games: Game[]; width: number; columns?: number }> = ({
  columns = 2,
  games,
  width,
}) => {
  if (!width) {
    return null
  }

  const gamesGroupedByName = useMemo<Record<string, Game[]>>(
    () => groupBy(games, 'sortName'),
    [games],
  )

  const gameWidth = useMemo(() => {
    return Math.trunc(width / columns)
  }, [width, columns])

  return (
    <OrderedList width={width}>
      {Object.entries(gamesGroupedByName).map(([name, games]) => {
        const game = games[0]

        return (
          <ListItem key={game.id} width={gameWidth}>
            <Game cover={`coverArt/${game.oid.type}:${game.oid.id}`}>
              <GameTitle hidden={!!game.cover}>{game.name}</GameTitle>
            </Game>
          </ListItem>
        )
      })}
    </OrderedList>
  )
}

export default GameList
