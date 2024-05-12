import { ArrowDropDown } from '@mui/icons-material'
import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Divider,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
  styled,
} from '@mui/material'
import { FC, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { getIsAuthenticated } from '../api/client/state/authSlice'
import { IGame, IPlatform } from '../domain/types'

const Details = styled('div')(({ theme }) => ({
  '> * ': {
    marginBottom: `${theme.spacing(2)} !important`,

    '&:last-child': {
      marginBottom: `0 !important`,
    },
  },
}))
const Actions = styled('div')(({ theme }) => ({
  height: theme.spacing(4.5),
}))

const Description = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  overflowY: 'auto',
  height: 'calc(100vh - 196px)',
  marginTop: theme.spacing(2),
  scrollbarColor: `#fff ${theme.palette.background.default}`,
  textWrap: 'wrap',

  img: {
    maxWidth: '100%',
  },
}))

const sortGameActionPlatforms = (platforms: IPlatform[]): IPlatform[] => {
  const sortedPlatforms = platforms.slice()
  sortedPlatforms.sort((a, b) => {
    return a.toString().localeCompare(b.toString())
  })
  return sortedPlatforms
}

const GameDetails: FC<{ game: IGame }> = ({ game }) => {
  const isAuthenticated = useSelector(getIsAuthenticated)

  const platformOptions = useMemo(
    () => sortGameActionPlatforms(game.platformGames.map((gp) => gp.platform)),
    [game.platformGames],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const handlePlay = (selectedIndex) => (evt) => {
    fetch('/activate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'same-origin',
      body: new URLSearchParams({
        id: game.id.toString(),
        platformId: platformOptions[selectedIndex].id.id,
      }),
    })
  }

  const [open, setOpen] = useState(false)
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
  const platformsAnchorEl = useRef<HTMLDivElement>(null)
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
    <Details>
      <Typography variant="h4">{game.toString()}</Typography>

      <Actions ref={platformsAnchorEl}>
        {isAuthenticated && (
          <>
            <ButtonGroup
              variant="contained"
              color="primary"
              aria-label="Platforms in which to play the game"
            >
              <Button onClick={handlePlay(selectedIndex)}>
                {platformOptions[selectedIndex].toString()}
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
                            key={option.id.toString()}
                            selected={index === selectedIndex}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                          >
                            {option.toString()}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </>
        )}
      </Actions>
      <Divider />
      <Description>
        <div dangerouslySetInnerHTML={{ __html: game.description }}></div>
      </Description>
    </Details>
  )
}

export default GameDetails
