import { Stack, Typography, styled } from '@mui/material'
import { FC, ReactNode } from 'react'
import type { IGame } from '../domain/types'

const Figure = styled('figure')(({ theme }) => ({
  margin: 0,
}))

const GameFigure: FC<{
  adornment?: ReactNode
  game: IGame
  style: any
  primaryText: string
  secondaryText: string
}> = ({
  adornment = null,
  game,
  primaryText = '',
  secondaryText = '',
  style,
}) => {
  return (
    <Figure style={style}>
      <img
        src={game.cover}
        alt={game.name}
        height="216px"
        width="216px"
        style={{ objectFit: 'cover' }}
      />
      <Stack>
        {adornment}
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
            lineClamp: 2,
            fontSize: '15px',
          }}
        >
          {primaryText}
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{
            textWrap: 'balance',
            lineHeight: '1.5',
            textOverflow: 'ellipsis',
            overflowY: 'hidden',
            maxHeight: '4rem',
            lineClamp: 2,
            fontSize: '13px',
          }}
        >
          {secondaryText}
        </Typography>
      </Stack>
    </Figure>
  )
}

export default GameFigure
