import { ImageList, styled } from '@mui/material'
import { useFetcher } from '@remix-run/react'
import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { getDeviceType } from '../api/client/state/layoutSlice'
import type { IGame, Match } from '../domain/types'
import GameImage from './GameImage'

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
`

const GameGrid: FC<{
  gameMatches: Match<IGame>[]
}> = ({ gameMatches }) => {
  const deviceType = useSelector(getDeviceType)
  const { columns, rowHeight, numberToPreload } = useMemo(() => {
    if (deviceType === 'mobile') {
      return {
        columns: 2,
        numberToPreload: 5,
        rowHeight: 210,
      }
    }

    if (deviceType === 'tablet') {
      return {
        columns: 5,
        numberToPreload: 15,
        rowHeight: 300,
      }
    }

    return {
      columns: 10,
      numberToPreload: 40,
      rowHeight: 300,
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
      <Helmet>
        {gameMatches.slice(0, numberToPreload).map((gameMatch) => {
          return (
            <link
              key={gameMatch.item.oid.asString}
              rel="preload"
              as="image"
              href={gameMatch.item.cover}
            />
          )
        })}
      </Helmet>
      <ImageListWithoutOverflow rowHeight={rowHeight} cols={columns}>
        {gameMatches.map((gameMatch, gameMatchIndex) => (
          <GameImage
            noDefer={gameMatchIndex <= numberToPreload}
            style={{ display: gameMatch.matches ? 'block' : 'none' }}
            height={`${rowHeight}px`}
            game={gameMatch.item}
            onActivate={playGame}
            key={gameMatch.item.oid.asString}
          />
        ))}
      </ImageListWithoutOverflow>
    </>
  )
}

export default GameGrid
