import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import mediaQuery from 'css-mediaquery'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    xxl: true
  }
}

const ssrMatchMedia =
  (deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown') => (query) => ({
    matches: mediaQuery.match(query, {
      width:
        deviceType === 'mobile'
          ? '390'
          : deviceType === 'tablet'
            ? '768px'
            : '1440px',
    }),
  })

const theme = (
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown',
) => {
  return responsiveFontSizes(
    createTheme({
      palette: {
        mode: 'dark',
        background: {
          default: 'rgb(32,38,52)',
          paper: 'rgb(40,48,68)',
        },
      },
      breakpoints: {
        values: {
          xxl: 1696,
          xl: 1366,
          lg: 1024,
          md: 768,
          sm: 430,
          xs: 390,
        },
      },
      components: {
        MuiUseMediaQuery: {
          defaultProps: {
            ssrMatchMedia: ssrMatchMedia(deviceType),
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: 'unset',
            },
          },
        },
        MuiTypography: {},
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              textRendering: 'optimizeLegibility',
              '*': {
                boxSizing: 'border-box',
              },
            },
          },
        },
      },
    }),
  )
}

export default theme
