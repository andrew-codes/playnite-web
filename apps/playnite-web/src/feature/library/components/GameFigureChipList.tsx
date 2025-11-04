import {
  Button,
  ButtonGroup,
  Chip,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  styled,
  useTheme,
} from '@mui/material'
import { uniq } from 'lodash'
import NextImage from 'next/image'
import { FC, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Platform } from '../../../../.generated/types.generated'
import { getCompletionStates } from '../../../api/client/state/completionStatesSlice'
import { Theme } from '../../../muiTheme'
import { useMe } from '../../account/hooks/me'
import { useUpdateRelease } from '../../game/hooks/updateRelease'
import { GameFigureContext } from './GameFigure'

const PlatformListItem: FC<{ platform: Platform | Array<Platform> }> = ({
  platform,
}) => {
  const theme = useTheme()

  if (Array.isArray(platform)) {
    if (platform.length === 0) {
      return null
    }

    return (
      <li>
        <Chip size="small" color="primary" label={`+${platform.length}`} />
      </li>
    )
  }

  return (
    <li>
      <NextImage
        width={24}
        height={24}
        data-test="PlatformListItem"
        alt={platform.name}
        src={platform.icon ?? ''}
        style={{
          borderRadius: `calc(${theme.shape.borderRadius} / 2)`,
        }}
      />
    </li>
  )
}

const GameFigureChipRoot = styled('div')(({ theme }) => ({
  borderRadius: `calc(${theme.shape.borderRadius} / 2)`,
  fontSize: '0.85rem',
  display: 'flex',
  height: '24px',
  alignItems: 'center',
  background: theme.palette.primary.main,
  padding: `0 ${theme.spacing(0.5)}`,
  '> *': {
    margin: `0 0 0 ${theme.spacing(0.5)}`,
  },
}))

const GameFigureChip: FC<{
  children: string
  completionStates: Array<{ id: string; name: string }>
}> = ({ children, completionStates }) => {
  const theme = useTheme<Theme>()
  const Icon = theme.completionStatus[children]?.Icon ?? (() => null)

  const [me] = useMe()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const selectedIndex = useMemo(
    () => completionStates.findIndex((status) => status.name === children),
    [children, completionStates],
  )
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  const game = useContext(GameFigureContext)
  const [updateGame] = useUpdateRelease()
  const handleMenuItemClick = (event, index) => {
    setOpen(false)
    if (!game?.primaryRelease?.id) {
      return
    }
    const completionStatusId = completionStates[index].id
    updateGame({
      variables: {
        release: {
          id: game.primaryRelease.id,
          completionStatus: completionStatusId,
        },
      },
    })
  }

  return me.data?.me?.isAuthenticated && game?.primaryRelease?.id ? (
    <ButtonGroup
      variant="contained"
      ref={anchorRef}
      aria-label="Completion Status Selector"
      sx={{ display: 'flex' }}
    >
      <Button
        size="small"
        sx={{
          padding: 0,
          backgroundColor: 'transparent !important',
          borderColor: 'transparent !important',
        }}
        onClick={handleOpen}
      >
        <GameFigureChipRoot
          style={{ ...(theme.palette.completionStatus[children] ?? {}) }}
        >
          {children}
          <Icon fontSize="small" />
        </GameFigureChipRoot>
      </Button>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
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
                  {completionStates.map((option, index) => (
                    <MenuItem
                      key={option.id}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
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
    </ButtonGroup>
  ) : (
    <GameFigureChipRoot
      style={{ ...(theme.palette.completionStatus[children] ?? {}) }}
    >
      {children}
      <Icon fontSize="small" />
    </GameFigureChipRoot>
  )
}

const List = styled('ol')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  listStyle: 'none',
  padding: theme.spacing(0.5),
  margin: 0,
  background: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,

  '> li': {
    marginRight: theme.spacing(0.5),
    height: '24px',

    '&:last-child': {
      marginRight: 0,
    },

    '& img': {
      height: '24px',
      width: '24px',
    },

    '& .MuiChip-colorPrimary': {
      background: theme.palette.background.default,
      color: theme.palette.common.white,
    },
  },
}))

const GameFigureChipList: FC<{
  platforms: Array<Platform>
  completionStatus: string
}> = ({ platforms, completionStatus }) => {
  const completionStates = useSelector(getCompletionStates)

  const maxPlatforms = 2
  const condensedPlatforms = useMemo(() => {
    return (
      uniq(platforms).slice(0, maxPlatforms) as (Platform | Array<Platform>)[]
    )
      .concat([platforms.slice(maxPlatforms)])
      .filter((platform) => platform)
  }, [platforms])

  return (
    <List data-test="GameFigureChipList">
      {condensedPlatforms.map((platform, index) => (
        <PlatformListItem platform={platform} key={index} />
      ))}
      <li>
        <GameFigureChip completionStates={completionStates}>
          {completionStatus}
        </GameFigureChip>
      </li>
    </List>
  )
}

export default GameFigureChipList
