'use client'

import { useQuery } from '@apollo/client/react'
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  GlobalStyles,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { debounce } from 'lodash-es'
import Image from 'next/image'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Game, Library } from '../../../../.generated/types.generated'
import { useUpdateGame } from '../../game/hooks/updateGame'
import GameGrid from '../../library/components/VirtualizedGameGrid'
import { useFilteredGames } from '../../library/hooks/useFilteredGames'
import { AllGamesQuery } from '../../library/queries'
import { Dialog } from '../../shared/components/Dialog'
import { PageTitle } from '../../shared/components/PageTitle'
import { Form } from '../../shared/components/forms/Form'
import { useSearchIgnGames } from '../hooks/searchIgnGames'

const ManageLibrary: FC<{ libraryId: string }> = ({ libraryId }) => {
  const { data } = useQuery<{ library: Library }>(AllGamesQuery, {
    variables: { libraryId },
  })
  const filteredGames = useFilteredGames(
    (data?.library?.games?.filter?.((g) => g) as Array<Game>) ?? [],
  )

  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  useEffect(() => {
    if (!ref.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // TODO: Remove magic numbers
        setWidth(Math.max(0, entry.contentRect.width - 15))
        setHeight(Math.min(window.innerHeight - 176, entry.contentRect.height))
      }
    })

    resizeObserver.observe(ref.current)

    const rect = ref.current.getBoundingClientRect()

    setWidth(Math.max(0, rect.width))
    setHeight(Math.max(0, rect.height))

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const [game, setGame] = useState<Game | null>(null)
  const handleSelectGame = useCallback((evt, game: Game) => {
    setGame(game)
    setSelectedCoverArtUrl(game.coverArt || '')
  }, [])

  const { searchGames, games: ignGames } = useSearchIgnGames()
  const handleCoverArtSearchChange = debounce(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const value = evt.target.value
      searchGames(value)
    },
    500,
  )
  const options = useMemo(() => {
    return ignGames.map((ignGame) => ({
      label: ignGame.metadata.names.name,
      value: ignGame.primaryImage?.url,
    }))
  }, [ignGames])

  const [selectedCoverArtUrl, setSelectedCoverArtUrl] = useState<string>(
    game?.coverArt || '',
  )
  const handleClose = useCallback((evt) => {
    evt.preventDefault()

    setGame(null)
    setSelectedCoverArtUrl('')
  }, [])
  const [updateGame] = useUpdateGame()
  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault()

      if (!game) return

      updateGame({
        variables: {
          input: {
            id: game.id,
            coverArt: selectedCoverArtUrl,
          },
        },
      })

      setGame(null)
    },
    [game, selectedCoverArtUrl, updateGame],
  )

  const theme = useTheme()
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <>
      <PageTitle title={`Manage Library - ${data?.library?.name ?? ''}`} />
      <GlobalStyles styles={{ body: { overflowY: 'hidden' } }} />
      <Box
        ref={ref}
        sx={(theme) => ({
          flex: 1,
          flexGrow: 1,
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          margin: '0 auto',
        })}
      >
        {width && height && (
          <GameGrid
            height={height}
            width={width}
            games={filteredGames}
            onSelect={handleSelectGame}
          />
        )}
      </Box>
      <Dialog
        open={!!game}
        onClose={handleClose}
        title={`Update ${game?.primaryRelease?.title || ''}`}
      >
        <Form data-name="manage-game" onSubmit={handleSubmit}>
          <Stack direction={'column'} spacing={2}>
            <Stack direction={fullScreenDialog ? 'column' : 'row'} spacing={2}>
              <FormControlLabel
                name="coverArt"
                disableTypography={true}
                labelPlacement="top"
                control={
                  <Autocomplete
                    filterOptions={(x) => x}
                    onChange={(evt, option) => {
                      const newOption = option as {
                        value: string
                        label: string
                      } | null
                      setSelectedCoverArtUrl(
                        newOption ? newOption.value : (game?.coverArt ?? ''),
                      )
                    }}
                    freeSolo
                    fullWidth
                    disableClearable
                    options={options}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoFocus
                        onChange={handleCoverArtSearchChange}
                        label="Search"
                        helperText="Search IGN games by title to find a matching game and cover art."
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            type: 'search',
                          },
                        }}
                      />
                    )}
                  />
                }
                label={<Typography variant="h2">Cover Art</Typography>}
                sx={{
                  flex: 1,
                  alignItems: 'flex-start',
                  justifyContent: 'start',
                  alignSelf: 'stretch',
                }}
              />
              <Stack
                direction="column"
                spacing={2}
                sx={{ minWidth: '200px', minHeight: '200px' }}
              >
                <Typography variant="h3">Preview</Typography>
                {selectedCoverArtUrl !== '' && (
                  <Image
                    src={selectedCoverArtUrl}
                    alt={`Selected cover art for ${game?.primaryRelease?.title || ''}`}
                    width={200}
                    height={200}
                  />
                )}
              </Stack>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: 'end',
            }}
          >
            <Button variant="contained" color="primary" type="submit">
              Save Changes
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClose}
              type="reset"
            >
              Cancel
            </Button>
          </Stack>
        </Form>
      </Dialog>
    </>
  )
}

export { ManageLibrary }
