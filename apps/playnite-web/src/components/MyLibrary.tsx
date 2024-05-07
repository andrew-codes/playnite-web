import { Box, Typography } from '@mui/material'
import { FC, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { getFilter } from '../api/client/state/librarySlice'
import GameGrid from '../components/GameGrid'
import Header from '../components/Header'
import FilteredGameList from '../domain/FilteredGameList'
import GameList from '../domain/GameList'
import type { IGame } from '../domain/types'
import OuterScroll from './OuterScroll'
import useThemeWidth from './useThemeWidth'

const MyLibrary: FC<{
  games: IGame[]
  onSelect?: (evt, game: IGame) => void
}> = ({ games = [] as IGame[], onSelect }) => {
  const gameList = useMemo(() => {
    return new GameList(games)
  }, [games])

  const filter = useSelector(getFilter)
  const filteredGames = useMemo(
    () => new FilteredGameList(gameList, filter),
    [gameList, filter],
  )

  const width = useThemeWidth()

  const noDeferCount = 25

  return (
    <>
      <Helmet>
        {gameList.items
          .filter((game, index) => index <= noDeferCount)
          .map((game) => (
            <link key={game.id} rel="preload" as="image" href={game.cover} />
          ))}
      </Helmet>
      <OuterScroll>
        <Header>
          <div>
            <Typography variant="h2">My Games</Typography>
            <Typography variant="subtitle1">
              {gameList.items.length} games in my library
            </Typography>
          </div>
        </Header>
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            width: '100%',
            margin: '0 auto',
            [theme.breakpoints.up('lg')]: {
              overflowY: 'auto',
              scrollbarColor: `${theme.palette.text.primary} ${theme.palette.background.default}`,
            },
            [theme.breakpoints.up('xl')]: {
              width: `${width}px`,
            },
          })}
        >
          <GameGrid
            games={filteredGames}
            noDeferCount={noDeferCount}
            onSelect={onSelect}
          />
        </Box>
      </OuterScroll>
    </>
  )
}

export default MyLibrary
