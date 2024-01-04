import { forwardRef, useCallback, useState } from 'react'
import { styled } from 'styled-components'

const SearchInput = styled.input<{ $height: number }>`
  display: flex;
  justify-content: center;
  border-radius: ${({ $height }) => $height / 2}px;
  padding: 0;
  color: darkslategray;
`

const Search = forwardRef<
  HTMLInputElement,
  {
    onSearch: (search: string) => void
    defaultValue: string
    height?: number
  }
>(({ onSearch, defaultValue = '', height = 0 }, ref) => {
  const [value, setValue] = useState(defaultValue)
  const handleOnChange = useCallback((e) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }, [])

  return (
    <SearchInput
      $height={height}
      onChange={handleOnChange}
      placeholder="Search"
      ref={ref}
      type="text"
      value={value}
    />
  )
})

export default Search
