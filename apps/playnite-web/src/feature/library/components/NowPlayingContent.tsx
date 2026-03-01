'use client'

import { Typography } from '@mui/material'
import { FC } from 'react'
import { NowPlayingGameItem } from '../../game/components/NowPlayingGameItem'
import { useNowPlayingGames } from '../hooks/nowPlayingGames'

const NowPlayingContent: FC<{
  username: string
  libraryId: string
}> = ({ username, libraryId }) => {
  const { data } = useNowPlayingGames(libraryId)
  const games = data?.library?.gamesNowPlaying ?? []

  if (games.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No games are currently playing.
      </Typography>
    )
  }

  return (
    <>
      {games.map((game) => (
        <NowPlayingGameItem
          key={game.id}
          game={game}
          username={username}
          libraryId={libraryId}
        />
      ))}
    </>
  )
}

export { NowPlayingContent }
