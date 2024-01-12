import styled from '@emotion/styled'
import { FC } from 'react'
import type { Game } from '../api/server/playnite/types'

const Game = styled.section<{
  cover: string
  height: number
  width: number
}>`
  background-image: ${({ cover }) => `url(${cover})`};
  height: ${({ height }) => `${height}px`};
  width: ${({ width }) => `${width}px`};
  box-sizing: border-box;
  background-size: cover;
  display: flex;
  flex: 1;
  padding: 0;
  margin: 0;
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

const GameListItem: FC<{
  cover: string
  width: number
  height: number
  game: Game
}> = ({ cover, game, width, height }) => {
  return (
    <Game cover={cover} height={height} width={width}>
      <GameTitle hidden={!!game.cover}>{game.name}</GameTitle>
    </Game>
  )
}

export default GameListItem
