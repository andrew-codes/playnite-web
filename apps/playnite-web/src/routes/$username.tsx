import { Typography } from '@mui/material'
import { useParams } from '@remix-run/react'
import { useCallback, useState } from 'react'
import { Game, Playlist } from '../../.generated/types.generated'
import GameDetails from '../components/GameDetails'
import Header from '../components/Header'
import HorizontalGameList from '../components/HorizontalGameList'
import Drawer from '../components/Navigation/Drawer'
import OuterContainer from '../components/OuterContainer'
import RightDrawer from '../components/RightDrawer'
import { usePlaylists } from '../queryHooks/playlists'
import { useUserLookup } from '../queryHooks/userLookup'
import { requiresUserSetup } from '../server/loaders/requiresUserSetup'

const loader = requiresUserSetup()

function Index() {
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [[playlistId, gameId], setGameSelection] = useState<
    [string | null, string | null]
  >([null, null])
  const handleClose = useCallback(() => {
    setRightDrawerOpen(false)
  }, [])
  const handleGameSelect = (playlist: Playlist) => (evt, game: Game) => {
    setGameSelection([playlist.id, game.id])
    setRightDrawerOpen(true)
  }

  const params = useParams<{ username: string }>()
  const { data: user } = useUserLookup(params.username ?? '')
  const { data, loading, error } = usePlaylists(params.username ?? '')
  const playlists = data?.playlists
  const game = playlists
    ?.find((p) => p.id === playlistId)
    ?.games.find((g) => g.id === gameId)

  return user?.lookupUser?.username ? (
    <Drawer>
      <OuterContainer>
        <Header>
          <Typography variant="h2">Playlists</Typography>
        </Header>
        {playlists?.map((playlist) => (
          <section data-test="playlist" key={`${playlist.id}`}>
            <Typography variant="h4">{playlist.name}</Typography>
            <HorizontalGameList
              games={playlist?.games ?? []}
              noDeferCount={5}
              onSelect={handleGameSelect(playlist)}
            />
          </section>
        ))}
      </OuterContainer>
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {game && <GameDetails game={game} />}
      </RightDrawer>
    </Drawer>
  ) : (
    <Drawer>
      <OuterContainer>
        <Header>
          <Typography variant="h2">Library not Found</Typography>
        </Header>
      </OuterContainer>
    </Drawer>
  )
}

export default Index
export { loader }
