import { FC, useMemo } from 'react'
import { styled } from 'styled-components'

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

const Game = styled.section`
  border: 1px solid rgb(255, 255, 255);
  display: flex;
  flex: 1;
  margin: 16px;
  padding: 8px;
`

const GameList: FC<{ games: any[]; width: number; columns?: number }> = ({
  columns = 2,
  games,
  width,
}) => {
  if (!width) {
    return null
  }

  const gameWidth = useMemo(() => {
    return Math.trunc(width / columns)
  }, [width, columns])

  return (
    <OrderedList width={width}>
      {games.map((game) => (
        <ListItem key={game.id} width={gameWidth}>
          <Game>{game.name}</Game>
        </ListItem>
      ))}
    </OrderedList>
  )
}

export default GameList
