import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  styled,
} from '@mui/material'
import { useFetcher } from '@remix-run/react'
import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getDeviceType } from '../api/client/state/layoutSlice'
import type { IGame } from '../domain/types'
import GameMenu from './GameMenu'

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
`

const GameGrid: FC<{
  games: IGame[]
}> = ({ games }) => {
  const deviceType = useSelector(getDeviceType)
  const { columns, rowHeight } = useMemo(() => {
    if (deviceType === 'mobile') {
      return {
        columns: 2,
        rowHeight: 210,
      }
    }

    if (deviceType === 'tablet') {
      return {
        columns: 5,
        rowHeight: 300,
      }
    }

    return {
      columns: 10,
      rowHeight: 300,
    }
  }, [deviceType])

  const numberToPreload = 40
  const fetcher = useFetcher()
  const playGame = useCallback(
    (evt: SyntheticEvent, id: string) => {
      fetcher.submit({ id }, { method: 'post', action: '/activate' })
    },
    [fetcher],
  )

  return (
    <ImageListWithoutOverflow rowHeight={rowHeight} cols={columns}>
      {games.map((game, gameIndex: number) => (
        <ImageListItem key={game.oid.asString}>
          <img
            alt={game.name}
            height={`${rowHeight}px`}
            loading={gameIndex < numberToPreload ? 'eager' : 'lazy'}
            src={game.cover}
          />
          <ImageListItemBar
            title={game.name}
            actionIcon={
              <GameMenu game={game.platforms} onActivate={playGame} />
            }
          />
        </ImageListItem>
      ))}
    </ImageListWithoutOverflow>
  )
}

export default GameGrid
