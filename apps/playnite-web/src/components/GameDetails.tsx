import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react/hooks/hooks.cjs'
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
import { useMe } from '../queryHooks'
import { Game, Platform } from '../server/graphql/types.generated'

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
  textWrap: 'wrap',

  img: {
    maxWidth: '100%',
  },
}))

const Activate_Mutation = gql`
  mutation Activate($gameReleaseId: String!) {
    activateGameRelease(gameReleaseId: $gameReleaseId) {
      id
    }
  }
`

const sortGameActionPlatforms = (platforms: Platform[]): Platform[] => {
  const sortedPlatforms = platforms.slice()
  sortedPlatforms.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
  return sortedPlatforms
}

const GameDetails: FC<{ game: Game }> = ({ game }) => {
  const { data } = useMe()

  const platforms = useMemo(
    () =>
      sortGameActionPlatforms(game.releases.map((release) => release.platform)),
    [game.releases],
  )
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [activate] = useMutation(Activate_Mutation)

  const handlePlay = (selectedIndex) => (evt) => {
    const gameRelease = platforms[selectedIndex]
    activate({
      variables: {
        gameReleaseId: gameRelease.id,
      },
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
    <Details data-test="GameDetails">
      <Typography variant="h4">{game.name}</Typography>

      <Actions ref={platformsAnchorEl}>
        {data?.me.isAuthenticated && (
          <>
            <ButtonGroup
              variant="contained"
              color="primary"
              aria-label="Platforms in which to play the game"
            >
              <Button onClick={handlePlay(selectedIndex)}>
                {platforms[selectedIndex].name}
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
                        {platforms.map((option, index) => (
                          <MenuItem
                            key={option.id}
                            selected={index === selectedIndex}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                          >
                            {option.name}
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
