import { createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

let defaults = {}

const setDefaults = (theme = {}) => {
  defaults = theme
}

const theme = () =>
  createTheme(
    deepmerge(defaults, {
      palette: {
        mode: 'dark',
      },
    }),
  )

export default theme
export { setDefaults }
