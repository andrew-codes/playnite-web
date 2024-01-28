import { createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: false
    sm: false
    md: false
    lg: false
    xl: false
    phone: true
    tablet: true
    desktop: true
  }
}

let defaults = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'rgb(32,38,52)',
      paper: 'rgb(40,48,68)',
    },
  },
  breakpoints: {
    values: {
      phone: 0,
      tablet: 1024,
      desktop: 1920,
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*': {
            boxSizing: 'border-box',
          },
        },
      },
    },
  },
})

const setDefaults = (theme = {}) => {
  defaults = createTheme(deepmerge(defaults, theme))
}

const theme = () => defaults

export default theme
export { setDefaults }
