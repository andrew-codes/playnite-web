import { styled, Typography } from '@mui/material'
import { FC } from 'react'
import { Game } from '../../../../.generated/types.generated'
import GameFigure from './GameFigure'

const GridRoot = styled('div')`
  display: grid;
  gap: 8px;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    gap: 24px;
  }

  ${({ theme }) => theme.breakpoints.up('xs')} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    grid-template-columns: repeat(3, 1fr);
  }

  ${({ theme }) => theme.breakpoints.up('lg')} {
    grid-template-columns: repeat(4, 1fr);
  }

  ${({ theme }) => theme.breakpoints.up('xl')} {
    grid-template-columns: repeat(6, 1fr);
  }

  ${({ theme }) => theme.breakpoints.up('xxl')} {
    grid-template-columns: repeat(9, 1fr);
  }

  @media (min-width: 0px) {
    @supports not (grid-template-columns: repeat(2, 1fr)) {
      grid-template-columns: repeat(6, 1fr);
    }
  }
`

const GameItem = styled('div')``

const GameGrid: FC<{
  games: Array<Game>
  onSelect?: (evt: React.MouseEvent, game: Game) => void
}> = ({ games, onSelect }) => {
  return (
    <GridRoot data-test="GameGrid">
      {games.map((game, index) => (
        <GameItem key={game.id}>
          <GameFigure
            game={game}
            width="100%"
            onSelect={(evt) => {
              onSelect?.(evt, game)
            }}
            priority={index < 50}
          >
            <Typography
              variant="caption"
              component="figcaption"
              sx={{
                fontWeight: 'bold',
                textWrap: 'balance',
                lineHeight: '1.5',
                textOverflow: 'ellipsis',
                overflowY: 'hidden',
                maxHeight: '4rem',
                lineClamp: '2',
                fontSize: '15px',
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical ',
              }}
            >
              {game.primaryRelease?.title || 'Unknown Game'}
            </Typography>
          </GameFigure>
        </GameItem>
      ))}
    </GridRoot>
  )
}

export default GameGrid
