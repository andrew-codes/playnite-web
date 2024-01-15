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

const GamePlatformList = styled('ol')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  height: '48px',
}))
const GamePlatformListItem = styled('li')(({ theme }) => ({
  display: 'inline-block',
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
        alt={game[0].name}
        height={`${height}px`}
        src={cover}
        width={`${width}px`}
      />
      <GamePlatformList>
        {game
          .filter((g) => !!g.platform)
          .map((g) => (
            <GamePlatformListItem key={g.id}>
              <img
                alt={g.platform?.name}
                height="48px"
                src={`gameAsset/icon/platform:${g?.platform?.id}`}
                width="48px"
              />
            </GamePlatformListItem>
          ))}
      </GamePlatformList>
    </Game>
  )
}

export default GameListItem
