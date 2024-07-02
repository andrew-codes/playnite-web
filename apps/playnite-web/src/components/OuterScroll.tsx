import { Box, useMediaQuery, useTheme } from '@mui/material'
import _ from 'lodash'
import { FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getScrollTo, scrolledTo } from '../api/client/state/layoutSlice'

const { debounce } = _

const OuterScroll: FC<PropsWithChildren<{}>> = ({ children }) => {
  const outerScroll = useRef<HTMLDivElement>(null)
  const scrollTo = useSelector(getScrollTo)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  useEffect(() => {
    if (isMobile && scrollTo === 0 && outerScroll.current) {
      outerScroll.current.scrollTo({ top: scrollTo, behavior: 'smooth' })
    }
  }, [scrollTo, isMobile])
  const dispatch = useDispatch()
  const ticking = useRef<boolean>(false)
  const handleScroll = useCallback(
    debounce((evt) => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          ticking.current = false
          dispatch(scrolledTo(evt.target?.scrollTop))
        })

        ticking.current = true
      }
    }, 200),
    [],
  )

  return (
    <Box
      onScroll={handleScroll}
      ref={outerScroll}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        height: `calc(100vh - ${theme.spacing(12)})`,
        padding: `0 ${theme.spacing()} 0 ${theme.spacing()}`,
        [theme.breakpoints.up('xs')]: {
          padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
        },
        [theme.breakpoints.only('md')]: {
          padding: `0 ${theme.spacing(3)} 0 ${theme.spacing(5)}`,
        },
        [theme.breakpoints.down('lg')]: {
          overflowY: 'auto',
        },
      })}
    >
      {children}
    </Box>
  )
}

export default OuterScroll
