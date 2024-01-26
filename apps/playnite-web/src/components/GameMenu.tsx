import { Menu as MenuIcon } from '@mui/icons-material'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { FC, SyntheticEvent, useState } from 'react'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from '../api/client/state/authSlice'
import { Game } from '../api/playnite/types'

const GameMenu: FC<{
  game: Game[]
  onActivate: (evt: SyntheticEvent, id: string) => void
}> = ({ game, onActivate }) => {
  const [anchorEl, setAnchorEl] = useState<null | Element>(null)
  const open = Boolean(anchorEl)
  const handleOpen = (event: SyntheticEvent) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => setAnchorEl(null)

  const isAuthenticated = useSelector(getIsAuthenticated)
  const handleActivate = (id: string) => (evt: SyntheticEvent) => {
    if (isAuthenticated) {
      onActivate(evt, id)
    }
  }

  return (
    <>
      <IconButton
        aria-label={`info about ${game[0].name}`}
        onClick={handleOpen}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        onClose={handleClose}
        open={open}
      >
        {game
          .filter((g) => !!g.platform)
          .map((g) => (
            <MenuItem key={g.id} onClick={handleActivate(g.id)}>
              {isAuthenticated
                ? `Play on ${g.platform?.name}`
                : g.platform?.name}
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}

export default GameMenu
