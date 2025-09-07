import { Menu as MenuIcon } from '@mui/icons-material'
import { IconButton, Menu, MenuItem } from '@mui/material'
import { Game } from 'apps/playnite-web/.generated/types.generated'
import { FC, SyntheticEvent, useState } from 'react'
import { useMe } from '../feature/account/hooks/me'

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

  const [me] = useMe()
  const handleActivate = (id: string) => (evt: SyntheticEvent) => {
    if (me.data?.me?.isAuthenticated) {
      onActivate(evt, id)
    }
  }

  return (
    <>
      <IconButton
        aria-label={`info about ${game[0]?.primaryRelease?.title}`}
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
          .filter((g) => !!g.primaryRelease?.platform)
          .map((g) => (
            <MenuItem key={g.id} onClick={handleActivate(g.id)}>
              {me.data?.me?.isAuthenticated
                ? `Play on ${g.primaryRelease?.platform.name}`
                : g.primaryRelease?.platform.name}
            </MenuItem>
          ))}
      </Menu>
    </>
  )
}

export default GameMenu
