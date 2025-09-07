import { Box, Button, Stack, styled } from '@mui/material'
import { createContext, FC, PropsWithChildren } from 'react'
import { Game } from '../../../../.generated/types.generated'
import GameFigureChipList from './GameFigureChipList'

const Context = createContext<Game | null>(null)

const Figure = styled('figure', {
  shouldForwardProp: (prop) => prop !== 'width',
})<{ width: string }>(({ theme, width }) => ({
  width,
  margin: 0,
}))

const Image = styled('img', {
  shouldForwardProp: (prop) => prop !== 'width',
})<{ width: string }>(({ width, theme }) => ({
  borderRadius: theme.shape.borderRadius,
  height: `${width}`,
  objectFit: 'cover',
  width,
  display: 'block',
}))

const GameFigure: FC<
  PropsWithChildren<{
    game: Game
    priority: boolean
    style?: any
    width: string
    onSelect?: (evt, game: Game) => void
  }>
> = ({ children, game, priority, style, onSelect, width }) => {
  return (
    <Context.Provider value={game}>
      <Figure
        data-test="GameFigure"
        data-test-game-id={game.id}
        style={style}
        width={width}
      >
        <Box sx={{ position: 'relative' }}>
          <Button
            onClick={(evt) => onSelect?.(evt, game)}
            sx={(theme) => ({
              padding: 0,
              height: width,
              width,
              borderRadius: `${theme.shape.borderRadius}px`,
              boxShadow: theme.shadows[3],
            })}
          >
            {game.primaryRelease?.cover && (
              <Image
                data-test="GameCoverImage"
                src={`${game.primaryRelease?.cover}`}
                alt={game.primaryRelease?.title}
                width={width}
                loading={priority ? 'eager' : 'lazy'}
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
