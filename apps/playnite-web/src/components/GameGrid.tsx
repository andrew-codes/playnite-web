import { ImageList, styled } from '@mui/material'
import { useFetcher } from '@remix-run/react'
import {
  FC,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSelector } from 'react-redux'
import { getDeviceFeatures } from '../api/client/state/deviceFeaturesSlice'
import type { IGame, IList, Match } from '../domain/types'
import GameImage from './GameImage'

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
`

const GameGrid: FC<{
  games: IList<Match<IGame>>
}> = ({ games }) => {
  const {
    device: { type: deviceType },
  } = useSelector(getDeviceFeatures)
  const { columns, rowHeight, numberToPreload } = useMemo(() => {
    if (deviceType === 'mobile') {
      return {
        columns: 2,
        numberToPreload: 8,
        rowHeight: 210,
      }
    }

    if (deviceType === 'tablet') {
      return {
        columns: 5,
        numberToPreload: 25,
        rowHeight: 300,
      }
    }

    return {
      columns: 10,
      numberToPreload: 40,
      rowHeight: 300,
    }
  }, [])

  const [state, setState] = useState({ columns, rowHeight })
  useEffect(() => {
    if (
      window.screen.orientation.type.startsWith('landscape') &&
      deviceType === 'mobile'
    ) {
      setState((state) => ({ ...state, columns: 5 }))
    }
  }, [])

  useEffect(() => {
    const handleOrientationChange = (evt) => {
      if (window.screen.orientation.type.startsWith('landscape')) {
        setState((state) => ({ ...state, columns: 5 }))
      } else {
        setState((state) => ({ ...state, columns: 2 }))
      }
    }
    window.addEventListener('orientationchange', handleOrientationChange)
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  const fetcher = useFetcher()
  const playGame = useCallback(
    (evt: SyntheticEvent, id: string) => {
      fetcher.submit({ id }, { method: 'post', action: '/activate' })
    },
    [fetcher],
  )

  return (
    <>
      <ImageListWithoutOverflow
        rowHeight={state.rowHeight}
        cols={state.columns}
      >
        {games.items.map((game, gameMatchIndex) => (
          <GameImage
            noDefer={gameMatchIndex <= numberToPreload}
            style={{ display: game.matches ? 'block' : 'none' }}
            height={`${state.rowHeight}px`}
            game={game}
            onActivate={playGame}
            key={game.oid.asString}
          />
        ))}
      </ImageListWithoutOverflow>
    </>
  )
}

export default GameGrid
