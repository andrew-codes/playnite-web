import { Box, Typography } from '@mui/material'
import { FC } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { getFilter } from '../api/client/state/librarySlice'
import GameGrid from '../components/GameGrid'
import Header from '../components/Header'
import { Game } from '../server/graphql/types.generated'
import OuterScroll from './OuterScroll'
import useThemeWidth from './useThemeWidth'

const MyLibrary: FC<{
  games: Array<Game>
  onSelect?: (evt, game: Game) => void
}> = ({ games, onSelect }) => {
  const filter = useSelector(getFilter)
  // const filteredGames = useMemo(
  //   () => new FilteredGameList(games, filter),
  //   [gameList, filter],
  // )

  const width = useThemeWidth()

  const noDeferCount = 25

  return (
    <>
      <Helmet>
        {games
          .filter((game, index) => index <= noDeferCount)
          .map((game) => (
            <link
              key={game.id.toString()}
              rel="preload"
              as="image"
              href={`/gameAsset/cover/${game.id}`}
            />
          ))}
      </Helmet>
      <OuterScroll>
        <Header>
          <div>
            <Typography variant="h2">My Games</Typography>
            <Typography variant="subtitle1">
              <span>{games.length}</span>&nbsp;games in library
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
            },
            [theme.breakpoints.up('xl')]: {
              width: `${width}px`,
            },
          })}
        >
          <GameGrid
            games={games}
            noDeferCount={noDeferCount}
            onSelect={onSelect}
          />
        </Box>
      </OuterScroll>
    </>
  )
}

export default MyLibrary
