import { Box, Button, Stack, styled } from '@mui/material'
import { createContext, FC, PropsWithChildren } from 'react'
import { Game } from '../../.generated/types.generated'
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
  boxShadow: theme.shadows[3],
  height: `${width}`,
  objectFit: 'cover',
  width,
  display: 'block',
}))

const GameFigure: FC<
  PropsWithChildren<{
    game: Game
    style?: any
    width: string
    height: string
    onSelect?: (evt, game: Game) => void
  }>
> = ({ children, game, style, onSelect, width, height }) => {
  return (
    <Context.Provider value={game}>
      <Figure
        data-test="GameFigure"
        data-test-game-id={game.id}
        style={style}
        width={width}
      >
        <Box sx={{ position: 'relative' }} key={`${game.id}-image`}>
          <Button onClick={(evt) => onSelect?.(evt, game)} sx={{ padding: 0 }}>
            <Image
              src={`${game.primaryRelease?.cover}`}
              alt={game.primaryRelease?.title}
              width={width}
              loading="eager"
            />
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
              completionStatus={game.completionStatus?.name}
              platforms={game.releases.map((release) => release.platform)}
            />
          </Box>
        </Box>
        <Stack
          sx={(theme) => ({
            height: `calc(${height} - ${width})`,
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
