import { TextField } from '@mui/material'
import { forwardRef, useCallback } from 'react'

const Search = forwardRef<
  HTMLInputElement,
  {
    onSearch: (search: string) => void
    defaultValue?: string
  }
>(({ onSearch, defaultValue = '' }) => {
  const handleOnChange = useCallback((e) => {
    onSearch(e.target.value)
  }, [])

  return (
    <TextField
      onChange={handleOnChange}
      placeholder="Find"
      type="text"
      defaultValue={defaultValue}
      variant="outlined"
    />
  )
})

export default Search
