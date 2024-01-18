import { ClickAwayListener, Menu, MenuItem, styled } from '@mui/material'
import { FC, SyntheticEvent, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from '../api/client/state/authSlice'
import type { Game } from '../api/playnite/types'

const Game = styled('div')(({ theme }) => ({
  backgroundSize: 'cover',
  boxSizing: 'border-box',
  display: 'flex',
  flex: 1,
  padding: 0,
  margin: 0,
  position: 'relative',
}))

const GamePlatformList = styled('ol')(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  height: '48px',
}))
const GamePlatformListItem = styled('li')(({ theme }) => ({
  display: 'inline-block',
}))

const GameImage = styled('img')(({ theme }) => ({}))

const GameListItem: FC<{
  cover: string
  game: Game[]
  onActivate: (evt: SyntheticEvent, id: string) => void
  height: number
  width: number
}> = ({ cover, game, height, onActivate, width }) => {
  const isAuthenticated = useSelector(getIsAuthenticated)

  const [anchorEl, setAnchorEl] = useState<null | Element>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event: SyntheticEvent) => {
    if (!isAuthenticated) {
      return
    }
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  const handleActivate = (id: string) => (evt: SyntheticEvent) => {
    onActivate(evt, id)
  }

  const platformGames = useMemo(() => game.filter((g) => !!g.platform), [game])

  return (
    <Game onClick={handleOpen}>
      <ClickAwayListener onClickAway={handleClose}>
        <GameImage
          alt={game[0].name}
          height={`${height}px`}
          src={cover}
          width={`${width}px`}
        />
      </ClickAwayListener>
      <GamePlatformList>
        {platformGames.map((g) => (
          <GamePlatformListItem key={g.id}>
            <img
              alt={g.platform?.name}
              height="48px"
              src={`gameAsset/icon/platform:${g?.platform?.id}`}
              width="48px"
            />
          </GamePlatformListItem>
        ))}
      </GamePlatformList>
      {isAuthenticated && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {platformGames.map((g) => (
            <MenuItem key={g.id} onClick={handleActivate(g.id)}>
              Play on {g.platform?.name}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Game>
  )
}

export default GameListItem
