import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import _ from 'lodash'
import { createRef, useCallback, useEffect, useReducer } from 'react'
import { authenticator } from '../api/auth/auth.server'
import PlayniteApi from '../api/playnite/index.server'
import type { Game } from '../api/playnite/types'
import GameGrid from '../components/GameGrid'
import Search from '../components/Search'
import WithNavigation from '../components/WithNavigation'

const { debounce } = _

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

  const user = await authenticator.isAuthenticated(request)

  return json({
    user,
    games,
  })
}

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
  const ref = createRef<HTMLInputElement>()
  useEffect(() => {
    if (!search.isSearching) {
      return
    }
    ref.current?.focus()
  }, [search.isSearching, ref.current])
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
        height={48}
        onSearch={debouncedSearch}
        ref={ref}
      />
    ),
    [debouncedSearch, ref, search.query],
  )

  const { games } = useLoaderData() as unknown as {
    games: Game[]
  }
  const handleFilter = useCallback(
    (game: Game) => game.name.toLowerCase().includes(search.query),
    [search.query],
  )

  return (
    <WithNavigation>
      <GameGrid games={games} />
    </WithNavigation>
  )
}

export default Index
export { loader }
