import {
  ImageList,
  ImageListItem,
  ImageListItemBar,
  styled,
} from '@mui/material'
import { useFetcher } from '@remix-run/react'
import _ from 'lodash'
import { FC, SyntheticEvent, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet'
import { useSelector } from 'react-redux'
import { getDeviceType } from '../api/client/state/layoutSlice'
import type { Game } from '../api/playnite/types'
import GameMenu from './GameMenu'

const { groupBy, stubTrue } = _

const ImageListWithoutOverflow = styled(ImageList)`
  overflow-y: hidden;
`

const GameGrid: FC<{
  games: Game[]
  onFilter?: (game: Game) => boolean
}> = ({ games, onFilter = stubTrue }) => {
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

  const normalizedGames = useMemo<Game[][]>(() => {
    const filteredGames = games.filter((g) => !!g.platform).filter(onFilter)
    return Object.values(groupBy(filteredGames, 'sortName')) as Game[][]
  }, [games, onFilter])

  const numberToPreload = 40
  const preloadGames = useMemo(() => {
    return normalizedGames.slice(0, numberToPreload)
  }, [])

  const prefetchGames = useMemo(() => {
    return normalizedGames.slice(numberToPreload + 1)
  }, [normalizedGames, numberToPreload])

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
        {preloadGames.map((game: Game[], gameIndex: number) => {
          return (
            <link
              key={`${gameIndex}-${game[0].oid.id}`}
              rel="preload"
              as="image"
              href={`gameAsset/cover/${game[0].oid.type}:${game[0].oid.id}`}
            />
          )
        })}
        {prefetchGames.map((game: Game[], gameIndex: number) => {
          return (
            <link
              key={`${gameIndex}-${game[0].oid.id}`}
              rel="prefetch"
              as="image"
              href={`gameAsset/cover/${game[0].oid.type}:${game[0].oid.id}`}
            />
          )
        })}
      </Helmet>

      <ImageListWithoutOverflow rowHeight={rowHeight} cols={columns}>
        {normalizedGames.map((game: Game[], gameIndex: number) => (
          <ImageListItem key={game[0].id}>
            <img
              alt={game[0].name}
              height={`${rowHeight}px`}
              loading={gameIndex < numberToPreload ? 'eager' : 'lazy'}
              src={`gameAsset/cover/${game[0].oid.type}:${game[0].oid.id}`}
            />
            <ImageListItemBar
              title={game[0].name}
              actionIcon={<GameMenu game={game} onActivate={playGame} />}
            />
          </ImageListItem>
        ))}
      </ImageListWithoutOverflow>
    </>
  )
}

export default GameGrid
