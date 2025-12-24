import { Box, Button, Stack, styled, useTheme } from '@mui/material'
import NextImage from 'next/image'
import { createContext, FC, PropsWithChildren } from 'react'
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
            {game.coverArt && (
              <NextImage
                quality={50}
                width={230}
                height={230}
                data-test="GameCoverImage"
                src={game.coverArt}
                sizes="(min-width: 3200px) 320px, (min-width: 2800px) 280px, (min-width: 2560px) 230px, (min-width: 1366px) 175px, (min-width: 1024px) 230px, (min-width: 992px) 320px, (min-width: 768px) 230px, (min-width: 576px) 230px, 175px"
                alt={game.primaryRelease?.title ?? 'Game Cover Art'}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={isHighFetchPriority ? 'high' : 'auto'}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
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
