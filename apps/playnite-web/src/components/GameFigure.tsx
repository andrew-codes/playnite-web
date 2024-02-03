import { Stack, Typography, styled } from '@mui/material'
import { FC, ReactNode, useCallback, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { IGame } from '../domain/types'

const Figure = styled('figure')(({ theme }) => ({
  margin: 0,
}))

const Image = styled('img', {
  shouldForwardProp: (prop) => prop !== 'width' && prop !== 'height',
})<{ height: string; width: string }>(({ height, width, theme }) => ({
  objectFit: 'cover',
  width: `calc(${width} - 16px)`,
  height: `calc(${height} - 48px)`,
}))

const GameFigure: FC<{
  adornment?: ReactNode
  game: IGame
  style?: any
  primaryText: string
  secondaryText: string
  width: string
  noDefer: boolean
  height: string
}> = ({
  adornment = null,
  game,
  height,
  primaryText = '',
  secondaryText = '',
  style,
  noDefer,
  width,
}) => {
  const [inView, setInView] = useState(false)
  const handleChange = useCallback((inView) => {
    setInView(true)
  }, [])
  const { ref } = useInView({ onChange: handleChange })

  return (
    <Figure style={style} ref={ref}>
      {inView || noDefer
        ? [
            <Image
              src={game.cover}
              alt={game.name}
              width={width}
              height={height}
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
