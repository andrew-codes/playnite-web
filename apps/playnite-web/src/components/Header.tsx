import { Divider, TextField, styled } from '@mui/material'
import { ChangeEvent, FC, PropsWithChildren, useCallback } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { setNameFilter } from '../api/client/state/librarySlice'

const HeaderContainer = styled('header')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
}))

const Filters = styled('section')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
}))

const Header: FC<PropsWithChildren<{ showFilters?: boolean }>> = ({
  children,
  showFilters,
}) => {
  const store = useStore()
  console.dir(store.getState())
  const dispatch = useDispatch()
  const handleSearch = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setNameFilter(event.target.value))
  }, [])

  return (
    <>
      <HeaderContainer>
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
      <Divider sx={{ margin: `48px 0` }} />
    </>
  )
}

export default Header
