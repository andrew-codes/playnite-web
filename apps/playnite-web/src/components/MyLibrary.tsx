import { Typography } from '@mui/material'
import { FC, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { getFilter } from '../api/client/state/librarySlice'
import GameGrid from '../components/GameGrid'
import Header from '../components/Header'
import FilteredGameList from '../domain/FilteredGameList'
import GameList from '../domain/GameList'
import type { GameOnPlatform } from '../domain/types'

const MyLibrary: FC<{ gamesOnPlatforms: GameOnPlatform[] }> = ({
  gamesOnPlatforms = [] as GameOnPlatform[],
}) => {
  const gameList = useMemo(() => {
    return new GameList(gamesOnPlatforms)
  }, [gamesOnPlatforms])

  const filter = useSelector(getFilter)
  const filteredGames = useMemo(
    () => new FilteredGameList(gameList, filter),
    [gameList, filter],
  )

  const noDeferCount = 25

  return (
    <>
      <Helmet>
        {gameList.items
          .filter((game, index) => index <= noDeferCount)
          .map((game) => (
            <link
              key={game.oid.asString}
              rel="preload"
              as="image"
              href={game.cover}
            />
          ))}
      </Helmet>
      <Header showFilters>
        <div>
          <Typography variant="h2">My Games</Typography>
          <Typography variant="subtitle1">
            {gameList.items.length} games in my library
          </Typography>
        </div>
      </Header>
      <GameGrid games={filteredGames} noDeferCount={noDeferCount} />
    </>
  )
}

export default MyLibrary
