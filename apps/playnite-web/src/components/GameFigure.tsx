import { Stack, Typography, styled } from '@mui/material'
import { FC, ReactNode, useCallback, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { IGame } from '../domain/types'

const Figure = styled('figure')(({ theme }) => ({
  margin: 0,
}))

const Image = styled('img', {
  shouldForwardProp: (prop) => prop !== 'width',
})<{ width: string }>(({ width, theme }) => ({
  objectFit: 'cover',
  width: `calc(${width} - 16px)`,
  height: `calc(${width} - 16px)`,
}))

const GameFigure: FC<{
  adornment?: ReactNode
  game: IGame
  style?: any
  primaryText: string
  secondaryText: string
  width: string
  noDefer: boolean
}> = ({
  adornment = null,
  game,
  primaryText = '',
  secondaryText = '',
  style,
  noDefer,
  width,
}) => {
  const [hasBeenInViewBefore, setHasBeenInViewBefore] = useState(false)
  const handleChange = useCallback((inView) => {
    setHasBeenInViewBefore(true)
  }, [])
  const { ref } = useInView({ onChange: handleChange })

  return (
    <Figure style={style} ref={ref}>
      {hasBeenInViewBefore || noDefer
        ? [
            <Image
              src={game.cover}
              alt={game.name}
              width={width}
              loading="eager"
            />,
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
            </Stack>,
          ]
        : []}
    </Figure>
  )
}

export default GameFigure
