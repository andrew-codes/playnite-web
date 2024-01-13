import { styled } from '@mui/material'
import { FC } from 'react'
import type { Game } from '../api/server/playnite/types'

const Game = styled('div')<{
  cover: string
}>(({ cover, theme }) => ({
  backgroundSize: 'cover',
  boxSizing: 'border-box',
  display: 'flex',
  flex: 1,
  padding: 0,
  margin: 0,
  position: 'relative',
  [theme.breakpoints.up('desktop')]: {
    minHeight: '400px',
    minWidth: '300px',
  },
  [theme.breakpoints.down('desktop')]: {
    minHeight: '282px',
    minWidth: '211px',
  },
}))

const GameImage = styled('img')(({ theme }) => ({
  width: '100%',
  flex: 1,
}))

const GameTitle = styled('span')(({ theme }) => ({
  color: '#fff',
  fontSize: '1.5rem',
  left: '10%',
  position: 'absolute',
  right: '10%',
  textAlign: 'center',
  top: '20%',
}))

const GameListItem: FC<{
  cover: string
  game: Game[]
}> = ({ cover, game }) => {
  return (
    <Game cover={cover}>
      <GameImage src={cover} alt={game[0].name} />
      <GameTitle hidden={!!cover}>{game[0].name}</GameTitle>
    </Game>
  )
}

export default GameListItem
