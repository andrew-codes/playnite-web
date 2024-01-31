import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import mediaQuery from 'css-mediaquery'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxs: true
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
          ? '960'
          : deviceType === 'tablet'
            ? '1440px'
            : '1696px',
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
          xl: 1440,
          lg: 1280,
          md: 1024,
          sm: 860,
          xs: 640,
          xxs: 390,
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
