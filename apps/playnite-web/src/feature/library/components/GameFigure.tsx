import { Box, Button, Stack, styled, useTheme } from '@mui/material'
import { createContext, FC, PropsWithChildren, useMemo } from 'react'
import { Game } from '../../../../.generated/types.generated'
import GameFigureChipList from './GameFigureChipList'

const Context = createContext<Game | null>(null)

const Figure = styled('figure', {
  shouldForwardProp: (prop) => prop !== 'width',
})<{}>(({ theme }) => ({
  margin: 0,
}))

const GameFigure: FC<
  PropsWithChildren<{
    game: Game
    priority: boolean
    isHighFetchPriority: boolean
    style?: any
    onSelect?: (evt, game: Game) => void
  }>
> = ({ children, game, priority, style, onSelect, isHighFetchPriority }) => {
  const theme = useTheme()

  return (
    <Context.Provider value={game}>
      <Figure
        data-test="GameFigure"
        data-test-game-id={game.id}
        style={{ ...style }}
      >
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={(evt) => onSelect?.(evt, game)}
            sx={(theme) => ({
              padding: 0,
              borderRadius: `${theme.shape.borderRadius}px`,
              boxShadow: theme.shadows[3],
              width: '100%',
            })}
          >
            {game.coverArt ? (
              <img
                data-test="GameCoverImage"
                src={game.coverArt}
                alt={game.primaryRelease?.title ?? 'Game Cover Art'}
                loading={priority ? 'eager' : 'lazy'}
                fetchpriority={isHighFetchPriority ? 'high' : 'auto'}
                width={230}
                height={230}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: theme.shape.borderRadius,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '175px',
                  borderRadius: theme.shape.borderRadius,
                }}
              />
            )}
          </Button>
          <Box
            sx={(theme) => ({
              position: 'absolute',
              bottom: '12px',
              right: theme.spacing(),
              display: 'flex',
              flexDirection: 'row',
            })}
          >
            <GameFigureChipList
              completionStatus={
                game.primaryRelease?.completionStatus?.name ?? 'Unknown'
              }
              platforms={game.releases.map((release) => release.platform)}
            />
          </Box>
        </Box>
        <Stack
          sx={(theme) => ({
            padding: theme.spacing(1),
          })}
          key={`${game.id}-details`}
        >
          {children}
        </Stack>
      </Figure>
    </Context.Provider>
  )
}

export default GameFigure
export { Context as GameFigureContext }
