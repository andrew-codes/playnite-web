import { Box, Button, Stack, styled } from '@mui/material'
import _ from 'lodash'
import { FC, PropsWithChildren, useCallback, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { IGame } from '../domain/types'
import PlatformList from './PlatformList'

const { uniqWith } = _

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
    onSelect?: (evt, game: IGame) => void
  }>
> = ({ children, game, style, noDefer, onSelect, width, height }) => {
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
            <Box sx={{ position: 'relative' }} key={`${game.id}-image`}>
              <Button onClick={(evt) => onSelect?.(evt, game)}>
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
                  />
                )}
              </Button>
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  bottom: '12px',
                  right: theme.spacing(),
                })}
              >
                <PlatformList
                  platforms={game.platformGames.map((gp) => gp.platform)}
                />
              </Box>
            </Box>,
            <Stack
              sx={{ height: `calc(${height} - ${width})` }}
              key={`${game.id}-details`}
            >
              {children}
            </Stack>,
          ]
        : []}
    </Figure>
  )
}

export default GameFigure
