'use client'

import { Replay, Stop } from '@mui/icons-material'
import { Box, Button, Stack, Typography, styled } from '@mui/material'
import NextImage from 'next/image'
import { FC } from 'react'
import { Game } from '../../../../.generated/types.generated'
import { useRestartRelease } from '../hooks/restartRelease'
import { useStopRelease } from '../hooks/stopRelease'
import { useNavigationRouter } from '../../shared/hooks/useNavigationRouter'

const ItemContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,

  '&:last-child': {
    borderBottom: 'none',
    marginBottom: 0,
    paddingBottom: 0,
  },
}))

const CoverArtContainer = styled('div')(({ theme }) => ({
  flexShrink: 0,
  width: 80,
}))

const InfoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  gap: theme.spacing(0.5),
}))

const LinkButton = styled(Button)(({ theme }) => ({
  padding: 0,
  minWidth: 'unset',
  textAlign: 'left',
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontWeight: 'inherit',
  lineHeight: 'inherit',
}))

const NowPlayingGameItem: FC<{
  game: Game
  username: string
  libraryId: string
}> = ({ game, username, libraryId }) => {
  const router = useNavigationRouter()
  const [stopRelease] = useStopRelease()
  const [restartRelease] = useRestartRelease()

  const runningRelease = game.releases?.find(
    (r) => r.runState === 'running' || r.runState === 'starting',
  )

  const title = game.primaryRelease?.title ?? ''
  const libraryName = game.library?.name ?? ''

  const handleTitleClick = () => {
    router.push(`/u/${username}/${libraryId}/game/${game.id}`)
  }

  const handleLibraryClick = () => {
    router.push(`/u/${username}/${libraryId}`)
  }

  const handleStop = () => {
    if (!runningRelease) return
    stopRelease({ variables: { id: runningRelease.id } })
  }

  const handleRestart = () => {
    if (!runningRelease) return
    restartRelease({ variables: { id: runningRelease.id } })
  }

  return (
    <ItemContainer>
      <CoverArtContainer>
        {game.coverArt ? (
          <NextImage
            src={game.coverArt}
            alt={title}
            width={80}
            height={80}
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 4 }}
          />
        ) : (
          <Box
            sx={(theme) => ({
              width: 80,
              height: 80,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
            })}
          />
        )}
      </CoverArtContainer>

      <InfoContainer>
        <LinkButton variant="text" onClick={handleTitleClick}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {title}
          </Typography>
        </LinkButton>

        <LinkButton variant="text" color="secondary" onClick={handleLibraryClick}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {libraryName}
          </Typography>
        </LinkButton>

        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Replay />}
            onClick={handleRestart}
            disabled={!runningRelease}
          >
            Restart
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Stop />}
            onClick={handleStop}
            disabled={!runningRelease}
          >
            Stop
          </Button>
          {/* Sidekick button — hidden until future story */}
          <Box sx={{ display: 'none' }}>
            <Button size="small" variant="outlined">
              Sidekick
            </Button>
          </Box>
        </Stack>
      </InfoContainer>
    </ItemContainer>
  )
}

export { NowPlayingGameItem }
