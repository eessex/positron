import { Box, color, Flex } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import Input from "@artsy/reaction/dist/Components/Input"
import { clone, compact, uniq } from "lodash"
import React, { Component, ReactNode } from "react"
import styled from "styled-components"

export interface Item {
  name?: string
  title?: string
}

export interface AutocompleteProps {
  disabled?: boolean
  filter?: any
  formatSelected?: any
  formatSearchResult?: (item: Item | undefined) => ReactNode
  items?: Item[]
  onSelect: any
  placeholder: string
  url: string
}

export class Autocomplete extends Component<AutocompleteProps> {
  private engine
  private textInput

  state = {
    searchResults: [],
    loading: false,
  }

  componentDidMount = () => {
    if (this.textInput) {
      this.addAutocomplete()
    }
  }

  addAutocomplete = () => {
    const { url, filter } = this.props

    const returnItems = items => {
      return items.results.map(item => {
        return {
          _id: item.id,
          title: item.title,
          thumbnail_image: item.thumbnail_image,
        }
      })
    }
    // @ts-ignore
    const datumTokenizer = Bloodhound.tokenizers.obj.whitespace("value")
    // @ts-ignore
    const queryTokenizer = Bloodhound.tokenizers.whitespace
    // @ts-ignore
    this.engine = new Bloodhound({
      datumTokenizer,
      queryTokenizer,
      remote: {
        url,
        filter: filter || returnItems,
        ajax: {
          beforeSend: () => {
            this.setState({ loading: true })
          },
          complete: () => {
            this.setState({ loading: false })
          },
        },
      },
    })
    this.engine.initialize()
  }

  search = value => {
    if (this.engine.remote.url !== this.props.url) {
      this.engine.remote.url = this.props.url
    }
    this.engine.get(value, searchResults => {
      this.setState({ searchResults })
    })
  }

  formatSelected = async selected => {
    const { formatSelected } = this.props

    try {
      if (!formatSelected) {
        return selected.id || selected._id
      } else {
        return await formatSelected(selected)
      }
    } catch (error) {
      new Error(error)
    }
  }

  onSelect = async selected => {
    const { items, onSelect } = this.props
    let newItems
    if (items) {
      newItems = clone(items)
    } else {
      newItems = []
    }

    try {
      const item = await this.formatSelected(selected)

      newItems.push(item)
      onSelect(uniq(newItems))
      this.onBlur()

      if (this.textInput) {
        this.textInput.focus()
      }
    } catch (err) {
      new Error(err)
    }
  }

  onBlur = () => {
    if (this.textInput) {
      this.textInput.blur()
      this.textInput.value = ""
    }
    this.setState({ searchResults: [] })
  }

  isFocused = () => {
    return this.textInput === document.activeElement
  }

  formatResult(item) {
    return (
      <AutocompleteResult>
        <AutocompleteResultImg width={45} height={45} mr={15}>
          {item.thumbnail_image && <img src={item.thumbnail_image || ""} />}
        </AutocompleteResultImg>
        <div>{item.title || item.name}</div>
      </AutocompleteResult>
    )
  }

  formatSearchResults = () => {
    const { formatSearchResult } = this.props
    const { loading } = this.state
    const searchResults = compact(this.state.searchResults)

    if (searchResults.length) {
      return searchResults.map((item, i) => {
        return (
          <div key={i} onClick={() => this.onSelect(item)}>
            {formatSearchResult ? (
              <AutocompleteResult>
                {formatSearchResult(item)}
              </AutocompleteResult>
            ) : (
              this.formatResult(item)
            )}
          </div>
        )
      })
    } else if (loading) {
      return (
        <AutocompleteResult>
          <div className="loading-spinner" />
        </AutocompleteResult>
      )
    } else {
      return <AutocompleteResult isEmpty>No results</AutocompleteResult>
    }
  }

  renderSearchResults = () => {
    if (this.isFocused()) {
      // display if input is focused
      return (
        <AutocompleteResults>
          <div>{this.formatSearchResults()}</div>
          <AutocompleteResultsBackground onClick={this.onBlur} />
        </AutocompleteResults>
      )
    }
  }

  render() {
    const { disabled, placeholder } = this.props

    return (
      <AutocompleteWrapper>
        <SearchIcon name="search" color="black" />
        <Input
          block
          disabled={disabled}
          innerRef={ref => (this.textInput = ref)}
          onChange={e => this.search(e.currentTarget.value)}
          placeholder={placeholder}
          type="text"
        />
        {this.renderSearchResults()}
      </AutocompleteWrapper>
    )
  }
}

const AutocompleteWrapper = styled.div`
  position: relative;

  input {
    padding-left: 36px;
  }
`

export const SearchIcon = styled(Icon)`
  position: absolute;
  top: 7px;
  left: 3px;
`

export const AutocompleteResults = styled.div`
  border-left: 1px solid ${color("black10")};
  border-right: 1px solid ${color("black10")};
  position: absolute;
  z-index: 10;
  width: 100%;
  top: calc(100% - 5px);
`

const AutocompleteResultsBackground = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  z-index: -1;
`

const AutocompleteResult = styled(Flex).attrs<{
  isEmpty?: boolean
  children?: any
}>({})`
  padding: 10px;
  background: white;
  color: ${color("black100")};
  align-items: center;
  border-bottom: 1px solid ${color("black10")};
  min-height: 50px;
  z-index: 3;

  &:hover {
    background: ${color("black10")};
    cursor: pointer;
  }

  ${props =>
    props.isEmpty &&
    `
    background: ${color("black10")};
    color: ${color("black30")};
  `};
`

export const AutocompleteResultImg = styled(Box)`
  background: ${color("black10")};
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
`
