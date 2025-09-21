import { Typography } from '@mui/material'
import { FC } from 'react'

const HelpSyncLibrary: FC<{}> = () => {
  return (
    <div className="help-sync-library">
      <Typography variant="h2">Sync Library</Typography>
      <Typography variant="body1">
        Here you can manage your library synchronization settings.
      </Typography>
    </div>
  )
}

export default HelpSyncLibrary
