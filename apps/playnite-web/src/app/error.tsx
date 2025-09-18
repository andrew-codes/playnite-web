import Typography from '@mui/material/Typography'
import { FC } from 'react'
import Header from '../components/Header'

const Error: FC<{ error: Error & { digest?: string }; reset: () => void }> = ({
  error,
  reset,
}) => {
  let errorTitle = <Typography variant="h1">Unexpected Error</Typography>
  let content = (
    <Typography variant="body1">
      Oops, Something went wrong. Please try again later.
    </Typography>
  )

  if (isRouteErrorResponse(error)) {
    if (error.status === 403) {
      errorTitle = <Typography variant="h1">Forbidden</Typography>

      content = (
        <div className="error-container">
          <p>You don't have permission to access this page.</p>
        </div>
      )
    } else if (error.status === 404) {
      errorTitle = <Typography variant="h1">Not Found</Typography>
      content = (
        <div className="error-container">
          <p>This is not the page you are looking for...</p>
        </div>
      )
    } else {
      errorTitle = <Typography variant="h1">{error.statusText}</Typography>
    }
  }

  return (
    <>
      <Header>{errorTitle}</Header>
      {content}
    </>
  )
}

export default Error
