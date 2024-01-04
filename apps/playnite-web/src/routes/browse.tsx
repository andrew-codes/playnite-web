import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { useCallback, useEffect, useReducer } from 'react'
import { useSelector } from 'react-redux'
import useDimensions from 'react-use-dimensions'
import { styled } from 'styled-components'
import { getGameDimensions } from '../api/client/state/layoutSlice'
import PlayniteApi from '../api/server/playnite'
import type { Game } from '../api/server/playnite/types'
import GameList from '../components/GameList'
import GameListItem from '../components/GameListItem'
import Search from '../components/Search'
import WithNavigation from '../components/WithNavigation'

const { debounce, merge } = _

async function loader({ request }: LoaderFunctionArgs) {
  const api = new PlayniteApi()
  const games = await api.getGames()
  games.sort((a, b) => {
    const aName = a.sortName
    const bName = b.sortName
    if (aName > bName) {
      return 1
    }
    if (aName < bName) {
      return -1
    }

    return 0
  })

  return json({
    games,
  })
}

const Main = styled.main`
  display: flex;
  align-items: center;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const spacing = 8

const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH/STARTED':
      return {
        isSearching: true,
        query: action.payload,
      }

    case 'SEARCH/STOPPED':
      return {
        isSearching: false,
        query: state.query,
      }

    default:
      return state
  }
}

function Index() {
  const [search, searchDispatch] = useReducer(searchReducer, {
    isSearching: false,
    query: '',
  })

  const [ref, { height }, node] = useDimensions()
  useEffect(() => {
    if (!search.isSearching) {
      return
    }

    node.focus()
  }, [search.isSearching, node])

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      searchDispatch({ type: 'SEARCH/STARTED', payload: search.toLowerCase() })
    }, 500),
    [],
  )

  const Toolbar = useCallback(
    () => (
      <Search
        defaultValue={search.query}
        height={height}
        onSearch={debouncedSearch}
        ref={ref}
      />
    ),
    [debouncedSearch, height, ref, search.query],
  )

  const { games } = useLoaderData() as unknown as { games: Game[] }
  const handleFilter = useCallback(
    (game: Game) => game.name.toLowerCase().includes(search.query),
    [search.query],
  )

  const [gameWidth, gameHeight] = useSelector(getGameDimensions)

  return (
    <WithNavigation Toolbar={Toolbar}>
      <Main>
        <GameList
          Game={GameListItem}
          gameHeight={gameHeight - spacing * 2}
          games={games}
          gameWidth={gameWidth - spacing * 2}
          onFilter={handleFilter}
          spacing={spacing}
        />
      </Main>
    </WithNavigation>
  )
}

export default Index
export { loader }
