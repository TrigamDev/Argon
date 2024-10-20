import { useRef } from 'react'
import type { ChangeEventHandler, FocusEvent, FocusEventHandler, RefObject } from 'react'
import { styled } from 'styled-components'
import { ClearIcon } from './ClearIcon'
import { SearchIcon } from './SearchIcon'

interface SearchInputProps {
  searchString: string
  setSearchString: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  setHighlightedItem: Function
  eraseResults: Function
  autoFocus: boolean
  onFocus: FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  onClear: Function
  placeholder: string
  showIcon: boolean
  showClear: boolean
  maxLength: number,
  multiline?: boolean
}

export default function SearchInput({
  searchString,
  setSearchString,
  setHighlightedItem,
  eraseResults,
  autoFocus,
  onFocus,
  onClear,
  placeholder,
  showIcon = true,
  showClear = true,
  maxLength,
  multiline = false
}: SearchInputProps) {
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  let manualFocus = true

  const setFocus = () => {
    manualFocus = false
    ref?.current && ref.current.focus()
    manualFocus = true
  }

  const handleOnFocus = (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    manualFocus && onFocus(event)
  }

  const maxLengthProperty = maxLength ? { maxLength } : {}

  return (
    <StyledSearchInput>
      <SearchIcon showIcon={showIcon} />
      { !multiline && <input
        type="text"
        ref={ref as RefObject<HTMLInputElement>}
		className='search-input'
        spellCheck={false}
        value={searchString}
        onChange={setSearchString}
        onFocus={handleOnFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={() => eraseResults()}
        onKeyDown={(event) => setHighlightedItem({ event })}
        data-test="search-input"
        {...maxLengthProperty}
      /> }
	  { multiline && <textarea
        ref={ref as RefObject<HTMLTextAreaElement>}
		className='search-input'
        spellCheck={false}
        value={searchString}
        onChange={setSearchString}
        onFocus={handleOnFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onBlur={() => eraseResults()}
        onKeyDown={(event) => setHighlightedItem({ event })}
        data-test="search-input"
        {...maxLengthProperty}
      /> }
      <ClearIcon
        showClear={showClear}
        setSearchString={setSearchString}
        searchString={searchString}
        onClear={onClear}
        setFocus={setFocus}
      />
    </StyledSearchInput>
  )
}

const StyledSearchInput = styled.div`
  min-height: ${(props: any) => props.theme.height};
  width: 100%;

  display: flex;
  align-items: center;

  > input {
    width: 100%;

    padding: 0 0 0 13px;

    border: none;
    outline: none;

    background-color: rgba(0, 0, 0, 0);
    font-size: inherit;
    font-family: inherit;

    color: ${(props: any) => props.theme.color};

    ::placeholder {
      color: ${(props: any) => props.theme.placeholderColor};
      opacity: 1;

      :-ms-input-placeholder {
        color: ${(props: any) => props.theme.placeholderColor};
      }

      ::-ms-input-placeholder {
        color: ${(props: any) => props.theme.placeholderColor};
      }
    }
  }
`
