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
  },
  breakpoints: {
    values: {
      phone: 0,
      tablet: 1024,
      desktop: 1920,
    },
  },
})

const setDefaults = (theme = {}) => {
  defaults = createTheme(deepmerge(defaults, theme))
}

const theme = () => defaults

export default theme
export { setDefaults }
