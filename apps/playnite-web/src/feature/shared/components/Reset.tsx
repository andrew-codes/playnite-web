'use client'

import { css, Global } from '@emotion/react'
import { useTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'

const Reset = () => {
  const theme = useTheme()

  return (
    <>
      <CssBaseline />
      <Global
        styles={css`
          * {
            scrollbar-color: ${theme.palette.text.primary}
              ${theme.palette.background.default};
          }
          ::-webkit-scrollbar {
            background-color: ${theme.palette.background.default};
          }
          ::-webkit-scrollbar-thumb {
            background-color: ${theme.palette.text.primary};
            border-radius: 10px;
          }
          ::-webkit-scrollbar-button {
            display: none;
          }
          ::-webkit-scrollbar-track {
            background-color: ${theme.palette.background.default};
          }
        `}
      />
    </>
  )
}

export { Reset }
