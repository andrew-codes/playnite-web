import { Divider, TextField, styled } from '@mui/material'
import _ from 'lodash'
import { ChangeEvent, FC, PropsWithChildren, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setNameFilter } from '../api/client/state/librarySlice'

const { debounce } = _

const HeaderContainer = styled('section')(({ theme }) => ({
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
  const dispatch = useDispatch()
  const handleSearch = useCallback(
    debounce((event: ChangeEvent<HTMLInputElement>) => {
      dispatch(setNameFilter(event.target.value))
    }, 400),
    [],
  )

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
      <Divider sx={{ margin: `16px 0` }} />
    </>
  )
}

export default Header
