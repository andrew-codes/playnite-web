import { Typography } from '@mui/material'
import { useCallback, useState } from 'react'
import { Game } from '../../.generated/types.generated'
import GameDetails from '../components/GameDetails'
import Header from '../components/Header'
import HorizontalGameList from '../components/HorizontalGameList'
import Drawer from '../components/Navigation/Drawer'
import OuterContainer from '../components/OuterContainer'
import RightDrawer from '../components/RightDrawer'
import { usePlaylists } from '../queryHooks/playlists'

function Index() {
  const [isRightDrawerOpen, setRightDrawerOpen] = useState(false)
  const [game, setGame] = useState<Game | null>(null)
  const handleClose = useCallback(() => {
    setRightDrawerOpen(false)
  }, [])
  const handleGameSelect = useCallback((evt, game: Game) => {
    setGame(game)
    setRightDrawerOpen(true)
  }, [])
  const { data, loading, refetch, error } = usePlaylists()
  const playlists = data?.playlists

  return (
    <Drawer>
      <OuterContainer>
        <Header>
          <Typography variant="h2">Library</Typography>
        </Header>
        {playlists?.map((playlist) => (
          <section data-test="playlist" key={`${playlist.id}`}>
            <Typography variant="h4">{playlist.name}</Typography>
            <HorizontalGameList
              games={playlist?.games ?? []}
              noDeferCount={5}
              onSelect={handleGameSelect}
            />
          </section>
        ))}
      </OuterContainer>
      <RightDrawer open={isRightDrawerOpen} onClose={handleClose}>
        {game && <GameDetails game={game} />}
      </RightDrawer>
    </Drawer>
  )
}

export default Index
