import {
  CheckCircle,
  EmojiEvents,
  LocalLibrary,
  Pause,
  PlayCircle,
  StopCircle,
} from '@mui/icons-material'
import * as styles from '@mui/material'
import mediaQuery from 'css-mediaquery'

type Theme = styles.Theme & {
  palette: {
    completionStatus: {
      Completed: {
        backgroundColor: string
        color: string
      }
      Beaten: {
        backgroundColor: string
        color: string
      }
      Playing: {
        backgroundColor: string
        color: string
      }
      Paused: {
        backgroundColor: string
        color: string
      }
      Backlog: {
        backgroundColor: string
        color: string
      }
      Quit: {
        backgroundColor: string
        color: string
      }
    }
  }
  completionStatus: {
    Completed: {
      Icon: React.ElementType
    }
    Beaten: {
      Icon: React.ElementType
    }
    Playing: {
      Icon: React.ElementType
    }
    Paused: {
      Icon: React.ElementType
    }
    Backlog: {
      Icon: React.ElementType
    }
    Quit: {
      Icon: React.ElementType
    }
  }
}

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
  return styles.responsiveFontSizes(
    styles.createTheme(
      {
        palette: {
          mode: 'dark',
          background: {
            default: 'rgb(31, 38, 52)',
            paper: 'rgb(40, 49, 68)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
          action: {
            hover: '#41495a',
          },
          primary: {
            main: 'rgb(181, 69, 155)',
          },
          text: {
            primary: 'rgb(246, 248, 247)',
            secondary: 'rgb(211, 221, 217)',
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
                backgroundColor: 'rgb(31, 38, 52)',
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
                  backgroundColor: 'rgb(40, 49, 68)',
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
                  backgroundColor: 'rgb(40, 49, 68)',
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
        shape: {
          borderRadius: 8,
        },
      },
      {
        palette: {
          completionStatus: {
            Beaten: {
              backgroundColor: 'rgb(37, 153, 37)',
              color: 'rgb(246, 248, 247)',
            },
            Completed: {
              backgroundColor: 'rgb(37, 153, 37)',
              color: 'rgb(246, 248, 247)',
            },
            Paused: {
              backgroundColor: 'rgb(57, 129, 230)',
              color: 'rgb(246, 248, 247)',
            },
            Playing: {
              backgroundColor: 'rgb(46, 46, 172)',
              color: 'rgb(246, 248, 247)',
            },
            Backlog: {
              backgroundColor: 'rgb(99, 32, 175)',
              color: 'rgb(246, 248, 247)',
            },
            Quit: {
              backgroundColor: 'rgb(255, 0, 0)',
              color: 'rgb(246, 248, 247)',
            },
          },
        },
        completionStatus: {
          Backlog: {
            Icon: LocalLibrary,
          },
          Beaten: {
            Icon: CheckCircle,
          },
          Completed: {
            Icon: EmojiEvents,
          },
          Paused: {
            Icon: Pause,
          },
          Playing: {
            Icon: PlayCircle,
          },
          Quit: {
            Icon: StopCircle,
          },
        },
      },
    ),
  )
}

export default theme
export type { Theme }
