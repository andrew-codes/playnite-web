import { Box, Divider, TextField, styled } from '@mui/material'
import _ from 'lodash'
import { ChangeEvent, FC, PropsWithChildren, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setNameFilter } from '../api/client/state/librarySlice'

const { debounce } = _

const HeaderContainer = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
}))

const Filters = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
}))

const Header: FC<PropsWithChildren<{ showFilters?: boolean }>> = ({
  children,
  showFilters,
  ...rest
}) => {
  const dispatch = useDispatch()
  const handleSearch = useCallback(
    debounce((event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setNameFilter(event.target.value))
    }, 400),
    [],
  )

  return (
    <>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          paddingTop: theme.spacing(4),
          top: 0,
          zIndex: 1800,
          backgroundColor: theme.palette.background.default,
          [theme.breakpoints.down('lg')]: {
            position: 'initial',
          },
        })}
      >
        <HeaderContainer {...rest}>
          {children}
          {showFilters && (
            <Filters>
              <TextField
                onChange={handleSearch}
                placeholder="Find"
                type="text"
                defaultValue=""
                variant="outlined"
              />
            </Filters>
          )}
        </HeaderContainer>
        <Divider sx={(theme) => ({ margin: `${theme.spacing(4)} 0` })} />
      </Box>
    </>
  )
}

export default Header
