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
import { Game, Release } from '../../.generated/types.generated'
import { useMe } from '../hooks/me'
import { useRestartRelease } from '../hooks/restartRelease'
import { useStartRelease } from '../hooks/startRelease'
import { useStopRelease } from '../hooks/stopRelease'
import { defaultSettings as defaultUserSettings } from '../server/userSettings'

const Details = styled('div')(({ theme }) => ({
  '> * ': {
    marginBottom: `${theme.spacing(2)} !important`,

    '&:last-child': {
      marginBottom: `0 !important`,
    },
  },
}))
const Actions = styled('ol')(({ theme }) => ({
  height: theme.spacing(4.5),
  display: 'flex',
  justifyContent: 'space-between',
  listStyle: 'none',
  padding: 0,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    height: 'auto',
    '& > *': {
      marginBottom: theme.spacing(1),
    },
  },
}))
const Action = styled('li')(({ theme }) => ({
  display: 'flex',
  'button:first-of-type': {
    flex: 1,
  },
  '> *': {
    flex: 1,
  },
}))

const Description = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  overflowY: 'auto',
  height: 'calc(100vh - 196px)',
  marginTop: theme.spacing(2),
  textWrap: 'wrap',

  img: {
    maxWidth: '100%',
  },
}))

const sortReleasesByPreferredPlatform = (
  releases: Array<Release>,
): Array<Release> => {
  const sortedReleases = releases.slice()
  const platformDisplays = {
    pc: { matcher: /PC/ },
    osx: { matcher: /Macintosh/ },
    linux: { matcher: /Linux/ },
    ps5: { matcher: /PlayStation 5/ },
    ps4: { matcher: /PlayStation 4/ },
    ps3: { matcher: /PlayStation 3/ },
    ps2: { matcher: /PlayStation 2/ },
    ps1: { matcher: /PlayStation/ },
  }

  const sortOrder = [
    platformDisplays.pc,
    platformDisplays.osx,
    platformDisplays.linux,
    platformDisplays.ps5,
    platformDisplays.ps4,
    platformDisplays.ps3,
    platformDisplays.ps2,
    platformDisplays.ps1,
  ]

  sortedReleases.sort((a, b) => {
    const aSort = sortOrder.findIndex((p) => p.matcher.test(a?.platform.name))
    const bSort = sortOrder.findIndex((p) => p.matcher.test(b.platform.name))
    if (aSort > bSort) {
      return 1
    }
    if (aSort < bSort) {
      return -1
    }
    return 0
  })

  return sortedReleases
}

const GameDetails: FC<{ game: Game }> = ({ game }) => {
  const [{ data }] = useMe()
  const hasWebhookSetting = !!data?.me.settings.find(
    (s) => s.name === defaultUserSettings.webhook.name,
  )?.value

  const releases = useMemo(
    () => sortReleasesByPreferredPlatform(game.releases),
    [game.releases],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [startRelease] = useStartRelease()
  const [stopRelease] = useStopRelease()
  const [restartRelease] = useRestartRelease()

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
    <Details data-test="GameDetails" data-release-id={game.primaryRelease?.id}>
      <Typography variant="h3" data-test="Name">
        {game.primaryRelease?.title}
      </Typography>

      <Actions ref={platformsAnchorEl} data-test="Actions">
        {data?.me.isAuthenticated && hasWebhookSetting && (
          <>
            <Action>
              <ButtonGroup
                variant="contained"
                color="primary"
                aria-label="Platforms in which to play the game"
              >
                <Button
                  data-release-id={releases[selectedIndex].id}
                  sx={{ minWidth: '296px !important' }}
                  onClick={(evt) => {
                    startRelease({
                      variables: {
                        id: releases[selectedIndex].id,
                      },
                    })
                  }}
                >
                  {releases[selectedIndex].platform.name} via{' '}
                  {releases[selectedIndex].source.name}
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
                          {releases
                            .filter((r) => true)
                            .map((option, index) => (
                              <MenuItem
                                key={option.id}
                                selected={index === selectedIndex}
                                onClick={(event) =>
                                  handleMenuItemClick(event, index)
                                }
                              >
                                {option.platform.name} via {option.source.name}
                              </MenuItem>
                            ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Action>
            {releases.some(
              (r) => r.runState === 'starting' || r.runState === 'started',
            ) && (
              <>
                <Action>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={(evt) =>
                      restartRelease({
                        variables: { id: releases[selectedIndex].id },
                      })
                    }
                  >{`Restart game`}</Button>
                </Action>
                <Action>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={(evt) =>
                      stopRelease({
                        variables: { id: releases[selectedIndex].id },
                      })
                    }
                  >{`Stop game`}</Button>
                </Action>
              </>
            )}
          </>
        )}
      </Actions>
      <Divider />
      <Description data-test="Description">
        <div
          dangerouslySetInnerHTML={{ __html: game.primaryRelease?.description }}
        ></div>
      </Description>
    </Details>
  )
}

export default GameDetails
