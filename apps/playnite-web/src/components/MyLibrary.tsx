import { Box, Typography } from '@mui/material'
import { FC } from 'react'
import { Helmet } from 'react-helmet'
import useDimensions from 'react-use-dimensions'
import { Game } from '../../.generated/types.generated'
import GameGrid from '../components/GameGrid'
import Header from '../components/Header'
import OuterContainer from './OuterContainer'
import useThemeWidth from './useThemeWidth'

const MyLibrary: FC<{
  games: Array<Game>
  onSelect?: (evt, game: Game) => void
}> = ({ games, onSelect }) => {
  const width = useThemeWidth()
  const [ref, dims] = useDimensions({ liveMeasure: true })

  return (
    <>
      <Helmet>
        {games
          .filter((game) => game.cover?.id)
          .slice(0, 15)
          .map((game) => (
            <link
              key={game.id}
              rel="preload"
              as="image"
              href={`/assets/asset-by-id/${game.cover?.id}`}
            />
          ))}
      </Helmet>
      <OuterContainer>
        <Header>
          <div>
            <Typography variant="h2">My Games</Typography>
            <Typography variant="subtitle1">
              <span>{games.length}</span>&nbsp;games in library
            </Typography>
          </div>
        </Header>
        <Box
          ref={ref}
          sx={(theme) => ({
            flexGrow: 1,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
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
            height={dims.height ?? 0}
            onSelect={onSelect}
          />
        </Box>
      </OuterContainer>
    </>
  )
}

export default MyLibrary
