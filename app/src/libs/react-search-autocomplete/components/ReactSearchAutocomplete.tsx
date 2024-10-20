import { default as Fuse } from 'fuse.js'
import React, { useEffect, useState } from 'react'
import type { ChangeEvent, FocusEvent, FocusEventHandler, KeyboardEvent } from 'react'
import { styled, ThemeProvider } from 'styled-components'
import { defaultFuseOptions, defaultTheme } from '../config/config'
import type { DefaultTheme } from '../config/config'
import { debounce } from '../utils/utils'
import Results from './Results'
import type { Item } from './Results'
import SearchInput from './SearchInput'

export const DEFAULT_INPUT_DEBOUNCE = 200
export const MAX_RESULTS = 10

export interface ReactSearchAutocompleteProps<T> {
  items: T[]
  fuseOptions?: Fuse.IFuseOptions<T>
  inputDebounce?: number
  onSearch?: (keyword: string, results: T[]) => void
  onHover?: (result: T) => void
  onSelect?: (result: T) => void
  onFocus?: FocusEventHandler<HTMLInputElement>
  onClear?: Function
  showIcon?: boolean
  showClear?: boolean
  maxResults?: number
  placeholder?: string
  autoFocus?: boolean
  styling?: DefaultTheme
  resultStringKeyName?: string
  inputSearchString?: string
  formatResult?: Function
  showNoResults?: boolean
  showNoResultsText?: string
  showItemsOnFocus?: boolean
  maxLength?: number
  className?: string,
  multi?: boolean,
  splitter?: string,
  sortResults?: (results: T[]) => T[],
  multiline?: boolean
}

export default function ReactSearchAutocomplete<T>({
  items = [],
  fuseOptions = defaultFuseOptions,
  inputDebounce = DEFAULT_INPUT_DEBOUNCE,
  onSearch = () => {},
  onHover = () => {},
  onSelect = () => {},
  onFocus = () => {},
  onClear = () => {},
  showIcon = true,
  showClear = true,
  maxResults = MAX_RESULTS,
  placeholder = '',
  autoFocus = false,
  styling = {},
  resultStringKeyName = 'name',
  inputSearchString = '',
  formatResult,
  showNoResults = true,
  showNoResultsText = 'No results',
  showItemsOnFocus = false,
  maxLength = 0,
  className,
  multi = false,
  splitter = ' ',
  sortResults = (results: T[]) => { return results },
  multiline = false
}: ReactSearchAutocompleteProps<T>) {
  const theme = { ...defaultTheme, ...styling }
  const options = { ...defaultFuseOptions, ...fuseOptions }

  const fuse = new Fuse(items, options)
  fuse.setCollection(items)

  const [searchString, setSearchString] = useState<string>(inputSearchString)
  const [results, setResults] = useState<any[]>([])
  const [highlightedItem, setHighlightedItem] = useState<number>(-1)
  const [isSearchComplete, setIsSearchComplete] = useState<boolean>(false)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [showNoResultsFlag, setShowNoResultsFlag] = useState<boolean>(false)
  const [hasFocus, setHasFocus] = useState<boolean>(false)

  useEffect(() => {
    setSearchString(getSearchString(inputSearchString))
    const timeoutId = setTimeout(() => setResults(sortResults(fuseResults(inputSearchString))), 0)

    return () => clearTimeout(timeoutId)
  }, [inputSearchString])

	useEffect(() => {
		if (searchString?.length > 0 && results && results?.length > 0) {
			let results = sortResults(fuseResults(searchString))
			setResults(results)
		}
	}, [items])

  useEffect(() => {
    if (
      showNoResults &&
      searchString.length > 0 &&
      !isTyping &&
      results.length === 0 &&
      !isSearchComplete
    ) {
      setShowNoResultsFlag(true)
    } else {
      setShowNoResultsFlag(false)
    }
  }, [isTyping, showNoResults, isSearchComplete, searchString, results])

  useEffect(() => {
    if (showItemsOnFocus && results.length === 0 && searchString.length === 0 && hasFocus) {
      setResults(sortResults(items.slice(0, maxResults)))
    }
  }, [showItemsOnFocus, results, searchString, hasFocus])

  useEffect(() => {
    const handleDocumentClick = () => {
      eraseResults()
      setHasFocus(false)
    }

    document.addEventListener('click', handleDocumentClick)

    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  const handleOnFocus = (event: FocusEvent<HTMLInputElement>) => {
    onFocus(event)
    setHasFocus(true)
  }

  function callOnSearch (keyword: string) {
    let newResults: T[] = [] as T[]

    keyword?.length > 0 && (newResults = fuseResults(keyword))

    setResults(sortResults(newResults))
    onSearch(getSearchString(keyword), newResults)
    setIsTyping(false)
  }

  const handleOnSearch = React.useCallback(
    inputDebounce > 0
      ? debounce((keyword: string) => callOnSearch(keyword), inputDebounce)
      : (keyword: string) => callOnSearch(keyword),
    [items]
  )

	const handleOnClick = (result: Item<T>) => {
		eraseResults()
		onSelect(result)

		let resultItem = result[resultStringKeyName]
		setSearchString(getSearchString(resultItem))

		setHighlightedItem(0)
	}

	function fuseResults<T> (keyword: string): T[] {
		keyword = keyword.replaceAll('!', '')
		if (multi) {
			let split = keyword.split(splitter)
			keyword = split[split.length - 1]
		}
		return fuse
			.search<T>(keyword, { limit: maxResults })
			.map((result) => ({ ...result.item as T }))
			.slice(0, maxResults) as T[]
	}

  const handleSetSearchString = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const keyword = target.value

    setSearchString(keyword)
    handleOnSearch(keyword)
    setIsTyping(true)

    if (isSearchComplete) {
      setIsSearchComplete(false)
    }
  }

  const eraseResults = () => {
    setResults([])
    setIsSearchComplete(true)
  }

  const handleSetHighlightedItem = ({
    index,
    event
  }: {
    index?: number
    event?: KeyboardEvent<HTMLInputElement>
  }) => {
    let itemIndex = -1

    const setValues = (index: number) => {
      setHighlightedItem(index)
      results?.[index] && onHover(results[index])
    }

    if (index !== undefined) {
      setHighlightedItem(index)
      results?.[index] && onHover(results[index])
    } else if (event) {
      switch (event.key) {
        case 'Enter':
          if (results.length > 0 && results[highlightedItem]) {
            event.preventDefault()
            onSelect(results[highlightedItem])

			let result = results[highlightedItem][resultStringKeyName]
			setSearchString(getSearchString(result))

			onSearch(getSearchString(result), results)
          } else {
            onSearch(searchString, results)
          }
          setHighlightedItem(-1)
          eraseResults()
          break
        case 'ArrowUp':
          event.preventDefault()
          itemIndex = highlightedItem > -1 ? highlightedItem - 1 : results.length - 1
          setValues(itemIndex)
          break
        case 'ArrowDown':
          event.preventDefault()
          itemIndex = highlightedItem < results.length - 1 ? highlightedItem + 1 : -1
          setValues(itemIndex)
          break
        default:
          break
      }
    }
  }

  function getSearchString(result: string) {
	  let split = searchString.split( splitter )
	  let fresh = split.slice(0, split.length - 1)

	  let excluding = isTermExclude()
	  if (excluding) result = `!${result}`

	if (!multi) return result
	else {
		fresh.push(result)
		return fresh.join(splitter)
	}
  }

  function isTermExclude() {
	let split = searchString.split( splitter )
	let last = split[split.length - 1]
	return last.startsWith('!')
  }

  return (
    <ThemeProvider theme={theme}>
      <StyledReactSearchAutocomplete className={className}>
        <div className="wrapper">
          <SearchInput
            searchString={searchString}
            setSearchString={handleSetSearchString}
            eraseResults={eraseResults}
            autoFocus={autoFocus}
            onFocus={handleOnFocus}
            onClear={onClear}
            placeholder={placeholder}
            showIcon={showIcon}
            showClear={showClear}
            setHighlightedItem={handleSetHighlightedItem}
            maxLength={maxLength}
			multiline={multiline}
          />
          <Results
            results={results}
            onClick={handleOnClick}
			getSearchString={getSearchString}
            setSearchString={setSearchString}
            showIcon={showIcon}
            maxResults={maxResults}
            resultStringKeyName={resultStringKeyName}
            formatResult={formatResult}
            highlightedItem={highlightedItem}
            setHighlightedItem={handleSetHighlightedItem}
            showNoResultsFlag={showNoResultsFlag}
            showNoResultsText={showNoResultsText}
          />
        </div>
      </StyledReactSearchAutocomplete>
    </ThemeProvider>
  )
}

const StyledReactSearchAutocomplete = styled.div`
  position: relative;

  height: ${(props: any) => parseInt(props.theme.height) + 2 + 'px'};

  .wrapper {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;

    border: ${(props: any) => props.theme.border};
    border-radius: ${(props: any) => props.theme.borderRadius};

    background-color: ${(props: any) => props.theme.backgroundColor};
    color: ${(props: any) => props.theme.color};

    font-size: ${(props: any) => props.theme.fontSize};
    font-family: ${(props: any) => props.theme.fontFamily};

    z-index: ${(props: any) => props.theme.zIndex};

    &:hover {
      box-shadow: ${(props: any) => props.theme.boxShadow};
    }
    &:active {
      box-shadow: ${(props: any) => props.theme.boxShadow};
    }
    &:focus-within {
      box-shadow: ${(props: any) => props.theme.boxShadow};
    }
  }
`
