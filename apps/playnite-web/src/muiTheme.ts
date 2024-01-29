import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

let defaults = responsiveFontSizes(
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
        xl: 1440,
        lg: 1280,
        md: 1024,
        sm: 860,
        xs: 640,
      },
    },
    components: {
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

const setDefaults = (theme = {}) => {
  defaults = createTheme(deepmerge(defaults, theme))
}

const theme = () => defaults

export default theme
export { setDefaults }
