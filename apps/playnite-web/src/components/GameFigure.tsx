import { Stack, styled } from '@mui/material'
import { FC, PropsWithChildren, useCallback, useState } from 'react'
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

  return (
    <Figure style={style} ref={ref}>
      {hasBeenInViewBefore || noDefer
        ? [
            <Image
              key={`${game.oid.asString}-image`}
              src={game.cover}
              alt={game.name}
              width={width}
              loading="eager"
            />,
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
