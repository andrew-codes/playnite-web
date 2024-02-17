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
          ? '390px'
          : deviceType === 'tablet'
            ? '768px'
            : '1366px',
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
          default: 'rgb(32, 38, 52)',
          paper: 'rgb(40, 48, 68)',
        },
        divider: 'rgba(255, 255, 255, 0.12)',
        action: {
          hover: '#41495a',
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
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
              borderBottom: `1px solid rgba(255, 255, 255, 0.12)`,
            },
          },
        },
        MuiUseMediaQuery: {
          defaultProps: {
            ssrMatchMedia: ssrMatchMedia(deviceType),
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: 'rgb(32, 38, 52)',
              backgroundImage: 'none',
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: 'unset',
            },
          },
        },
        MuiTypography: {
          styleOverrides: {
            h1: {},
          },
        },
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
        MuiSelect: {
          styleOverrides: {
            root: {
              '&': {
                backgroundColor: 'rgb(40, 48, 68)',
                '& fieldset': {
                  borderColor: 'rgb(255, 255, 255, 0.6)',

                  '&.Mui-focused': {
                    '& fieldset': {
                      borderColor: 'initial',
                    },
                  },
                },
              },
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiInputBase-root': {
                backgroundColor: 'rgb(40, 48, 68)',
                '& fieldset': {
                  borderColor: 'rgb(255, 255, 255, 0.6)',
                },

                '&.Mui-focused': {
                  '& fieldset': {
                    borderColor: 'initial',
                  },
                },
              },
            },
          },
        },
      },
    }),
  )
}

export default theme
