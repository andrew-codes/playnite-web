import { Box, Stack, styled } from '@mui/material'
import { FC, PropsWithChildren, useCallback, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { IGame } from '../domain/types'
import PlatformList from './PlatformList'

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
    game: IGame
    style?: any
    width: string
    height: string
    noDefer: boolean
  }>
> = ({ children, game, style, noDefer, width, height }) => {
  const [hasBeenInViewBefore, setHasBeenInViewBefore] = useState(false)
  const handleChange = useCallback((inView) => {
    if (!inView) {
      return
    }
    setHasBeenInViewBefore(true)
  }, [])
  const { ref } = useInView({ onChange: handleChange })

  const [imageHasError, setImageHasError] = useState(false)

  return (
    <Figure style={style} ref={ref} width={width}>
      {hasBeenInViewBefore || noDefer
        ? [
            <Box
              sx={{ position: 'relative' }}
              key={`${game.oid.asString}-image`}
            >
              {!imageHasError ? (
                <Image
                  src={game.cover}
                  alt={game.name}
                  width={width}
                  loading="eager"
                  onError={(e) => {
                    setImageHasError(true)
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: `${width}`,
                    width: `${width}`,
                  }}
                ></Box>
              )}
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  bottom: '12px',
                  right: theme.spacing(),
                })}
              >
                <PlatformList platforms={game.platforms} />
              </Box>
            </Box>,
            <Stack
              sx={{ height: `calc(${height} - ${width})` }}
              key={`${game.oid.asString}-details`}
            >
              {children}
            </Stack>,
          ]
        : []}
    </Figure>
  )
}

export default GameFigure
