import { Stack, Typography, styled } from '@mui/material'
import { FC, ReactNode } from 'react'
import type { IGame } from '../domain/types'

const Figure = styled('figure')(({ theme }) => ({
  margin: 0,
}))

const Image = styled('img', {
  shouldForwardProp: (prop) => prop !== 'width',
})<{ width: number }>(({ width, theme }) => ({
  objectFit: 'cover',
  width: `${width - 16}px`,
  height: `${width - 48}px`,
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
      <Image src={game.cover} alt={game.name} width={style.width} />
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
