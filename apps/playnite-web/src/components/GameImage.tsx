import { ImageListItem, ImageListItemBar } from '@mui/material'
import {
  FC,
  HTMLAttributes,
  SyntheticEvent,
  useCallback,
  useState,
} from 'react'
import { useInView } from 'react-intersection-observer'
import { IGame } from '../domain/types'
import GameMenu from './GameMenu'

const GameImage: FC<
  {
    game: IGame
    height: string
    onActivate: (evt: SyntheticEvent, id: string) => void
    noDefer?: boolean
  } & HTMLAttributes<HTMLLIElement>
> = ({ game, height, noDefer = false, onActivate, ...rest }) => {
  const [inView, setInView] = useState(false)
  const handleChange = useCallback((inView) => {
    setInView(true)
  }, [])
  const { ref } = useInView({ onChange: handleChange })

  return (
    <ImageListItem {...rest} ref={ref}>
      {inView || noDefer
        ? [
            <img
              alt={game.name}
              height={height}
              loading={noDefer ? 'eager' : 'lazy'}
              src={game.cover}
            />,
            <ImageListItemBar
              title={game.name}
              actionIcon={
                <GameMenu game={game.platforms} onActivate={onActivate} />
              }
            />,
          ]
        : []}
    </ImageListItem>
  )
}

export default GameImage
