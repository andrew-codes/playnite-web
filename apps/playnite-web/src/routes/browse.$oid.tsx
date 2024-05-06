import { ArrowDropDown } from '@mui/icons-material'
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from '@mui/material'
import { LoaderFunctionArgs, json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { $params } from 'remix-routes'
import { getIsAuthenticated } from '../api/client/state/authSlice'
import getGameApi from '../api/game/index.server'
import Oid from '../domain/Oid'
import { GameOnPlatform } from '../domain/types'

async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const { oid } = $params('/browse/:oid', params)
    const gameOid = new Oid(oid)

    const api = getGameApi()
    const game = await api.getGameById(gameOid.id)
    return json({
      game,
    })
  } catch (e) {
    return new Response(null, {
      status: 500,
    })
  }
}

function GameBrowserDetails() {
  const { game } = (useLoaderData() || {}) as unknown as {
    game: GameOnPlatform
  }

  const isAuthenticated = useSelector(getIsAuthenticated)

  const platformOptions = useMemo(
    () => game.platforms.map((platform) => platform.name),
    [game.platforms],
  )
  const platformsAnchorEl = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handlePlay = () => {
    fetch('/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        id: game.id,
        platformId: game.platforms[selectedIndex].id,
      }),
    })
  }

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index)
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event) => {
    if (
      platformsAnchorEl.current &&
      platformsAnchorEl.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

  return (
    <div>
      <Typography variant="h4">{game.name}</Typography>
      {isAuthenticated && (
        <div>
          <Typography variant="h5">Play</Typography>
          <ButtonGroup
            variant="contained"
            ref={platformsAnchorEl}
            aria-label="Platforms in which to play the game"
          >
            <Button onClick={handlePlay}>
              {platformOptions[selectedIndex]}
            </Button>
            <Button
              size="small"
              aria-controls={open ? 'split-button-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-label="Select Platform"
              aria-haspopup="menu"
              onClick={handleToggle}
            >
              <ArrowDropDown />
            </Button>
          </ButtonGroup>
          <Popper
            sx={{
              zIndex: 1,
            }}
            open={open}
            anchorEl={platformsAnchorEl.current}
            role={undefined}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === 'bottom' ? 'center top' : 'center bottom',
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" autoFocusItem>
                      {platformOptions.map((option, index) => (
                        <MenuItem
                          key={option}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: game.description }} />
    </div>
  )
}

export default GameBrowserDetails
export { loader }
