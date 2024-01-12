import styled from '@emotion/styled'
import { forwardRef, useCallback, useState } from 'react'

const SearchInput = styled.input<{ height: number }>`
  display: flex;
  justify-content: center;
  border-radius: ${({ height }) => height / 2}px;
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
>(({ onSearch, defaultValue = '', height }, ref) => {
  const [value, setValue] = useState(defaultValue)
  const handleOnChange = useCallback((e) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }, [])

  return (
    <SearchInput
      height={height ?? 48}
      onChange={handleOnChange}
      placeholder="Search"
      ref={ref}
      type="text"
      value={value}
    />
  )
})

export default Search
