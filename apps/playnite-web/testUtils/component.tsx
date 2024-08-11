import { Box, CssBaseline, ThemeProvider } from '@mui/material'
import { configureStore, StateFromReducersMapObject } from '@reduxjs/toolkit'
import { FC, PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { reducer } from '../src/api/client/state'
import muiTheme from '../src/muiTheme'

const TestWrapper: FC<
  PropsWithChildren<{
    preloadedState?: StateFromReducersMapObject<typeof reducer>
  }>
> = ({ children, preloadedState }) => {
  const store = configureStore({
    reducer,
    preloadedState: preloadedState ?? {},
  })

  return (
    <Provider store={store}>
      <ThemeProvider theme={muiTheme('desktop')}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  )
}

const Boundary: FC<PropsWithChildren<{ maxWidth?: number }>> = ({
  children,
  maxWidth = 200,
}) => {
  return (
    <Box padding={16} maxWidth={maxWidth}>
      {children}
    </Box>
  )
}

export * from './'
export { Boundary, TestWrapper }
