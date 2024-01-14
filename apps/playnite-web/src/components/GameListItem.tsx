import { styled } from '@mui/material'
import { FC } from 'react'
import type { Game } from '../api/server/playnite/types'

const Game = styled('div')(({ theme }) => ({
  backgroundSize: 'cover',
  boxSizing: 'border-box',
  display: 'flex',
  flex: 1,
  padding: 0,
  margin: 0,
  position: 'relative',
}))

const GameImage = styled('img')(({ theme }) => ({}))

const GameListItem: FC<{
  cover: string
  game: Game[]
  height: number
  width: number
}> = ({ cover, game, height, width }) => {
  return (
    <Game>
      <GameImage
        src={cover}
        alt={game[0].name}
        width={`${width}px`}
        height={`${height}px`}
      />
    </Game>
  )
}

export default GameListItem
