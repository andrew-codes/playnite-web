import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import _ from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch, useSelector } from 'react-redux'
import { getScrollTo, scrolledTo } from '../api/client/state/layoutSlice'
import { getFilter } from '../api/client/state/librarySlice'
import GameGrid from '../components/GameGrid'
import Header from '../components/Header'
import FilteredGameList from '../domain/FilteredGameList'
import GameList from '../domain/GameList'
import type { GameOnPlatform } from '../domain/types'
import useThemeWidth from './useThemeWidth'

const { debounce } = _

const MyLibrary: FC<{ gamesOnPlatforms: GameOnPlatform[] }> = ({
  gamesOnPlatforms = [] as GameOnPlatform[],
}) => {
  const gameList = useMemo(() => {
    return new GameList(gamesOnPlatforms)
  }, [gamesOnPlatforms])

  const filter = useSelector(getFilter)
  const filteredGames = useMemo(
    () => new FilteredGameList(gameList, filter),
    [gameList, filter],
  )

  const noDeferCount = 25

  const width = useThemeWidth()

  const outerScroll = useRef<HTMLDivElement>(null)
  const scrollTo = useSelector(getScrollTo)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  useEffect(() => {
    if (isMobile && scrollTo === 0 && outerScroll.current) {
      outerScroll.current.scrollTo({ top: scrollTo, behavior: 'smooth' })
    }
  }, [scrollTo, isMobile])
  const dispatch = useDispatch()
  const ticking = useRef<boolean>(false)
  const handleScroll = useCallback(
    debounce((evt) => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          ticking.current = false
          dispatch(scrolledTo(evt.target?.scrollTop))
        })

        ticking.current = true
      }
    }, 200),
    [],
  )

  return (
    <>
      <Helmet>
        {gameList.items
          .filter((game, index) => index <= noDeferCount)
          .map((game) => (
            <link
              key={game.oid.asString}
              rel="preload"
              as="image"
              href={game.cover}
            />
          ))}
      </Helmet>
      <Box
        onScroll={handleScroll}
        ref={outerScroll}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          height: `calc(100vh - ${theme.spacing(12)})`,
          padding: `0 ${theme.spacing()} 0 ${theme.spacing(2)}`,
          [theme.breakpoints.down('lg')]: {
            overflowY: 'auto',
            scrollbarColor: `${theme.palette.text.primary} ${theme.palette.background.default}`,
          },
        })}
      >
        <Header showFilters>
          <div>
            <Typography variant="h2">My Games</Typography>
            <Typography variant="subtitle1">
              {gameList.items.length} games in my library
            </Typography>
          </div>
        </Header>
        <Box
          sx={(theme) => ({
            flexGrow: 1,
            maxWidth: `${width}px`,
            margin: '0 auto',
            [theme.breakpoints.up('lg')]: {
              overflowY: 'auto',
              scrollbarColor: `${theme.palette.text.primary} ${theme.palette.background.default}`,
            },
          })}
        >
          <GameGrid games={filteredGames} noDeferCount={noDeferCount} />
        </Box>
      </Box>
    </>
  )
}

export default MyLibrary
