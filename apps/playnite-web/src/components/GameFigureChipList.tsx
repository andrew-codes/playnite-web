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
import { uniq } from 'lodash-es'
import { FC, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { Platform } from '../../.generated/types.generated'
import { Theme } from '../muiTheme'
import { useMe } from '../queryHooks'
import { allCompletionStatuses } from '../queryHooks/completionStatuses'
import { useUpdateGame } from '../queryHooks/useUpdateGame'
import { GameFigureContext } from './GameFigure'

const PlatformImage = styled('img')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius / 2,
}))

const PlatformListItem: FC<{ platform: Platform | Array<Platform> }> = ({
  platform,
}) => {
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

  let src = `/asset-by-id/${platform.icon?.id}`
  if (!platform.icon?.id) {
    if (/(windows)/i.test(platform.name)) {
      src = `/platforms/pc-windows.webp`
    } else if (/(mac)/i.test(platform.name)) {
      src = `/platforms/macintosh.webp`
    } else if (/(linux)/i.test(platform.name)) {
      src = `/platforms/pc-linux.webp`
    } else if (/(playstation)/i.test(platform.name)) {
      if (/5/i.test(platform.name)) {
        src = `/platforms/sony-playstation-5.webp`
      } else if (/4/i.test(platform.name)) {
        src = `/platforms/sony-playstation-4.webp`
      } else if (/3/i.test(platform.name)) {
        src = `/platforms/sony-playstation-3.webp`
      } else if (/2/i.test(platform.name)) {
        src = `/platforms/sony-playstation-2.webp`
      } else {
        src = `/platforms/sony-playstation.webp`
      }
    }
  }

  return (
    <li>
      <PlatformImage
        data-test="PlatformListItem"
        alt={platform.name}
        src={src}
      />
    </li>
  )
}

const GameFigureChipRoot = styled('div')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius / 2,
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

const GameFigureChip: FC<{ children: string }> = ({ children }) => {
  const theme = useTheme<Theme>()
  const Icon = theme.completionStatus[children].Icon ?? (() => null)

  const me = useMe()
  const completionStatuses = allCompletionStatuses()

  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const selectedIndex = useMemo(
    () => completionStatuses.findIndex((status) => status.name === children),
    [children, completionStatuses],
  )
  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  const game = useContext(GameFigureContext)
  const [updateGame] = useUpdateGame()
  const handleMenuItemClick = (event, index) => {
    setOpen(false)
    if (!game?.id) {
      return
    }
    const completionStatusId = completionStatuses[index].id
    updateGame({
      variables: {
        id: game?.id,
        input: {
          completionStatusId,
        },
      },
    })
  }

  return me.data?.me?.isAuthenticated ? (
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
                  {completionStatuses.map((option, index) => (
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
        <GameFigureChip>{completionStatus}</GameFigureChip>
      </li>
    </List>
  )
}

export default GameFigureChipList
