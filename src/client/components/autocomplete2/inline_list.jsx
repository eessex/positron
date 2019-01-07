import PropTypes from "prop-types"
import React, { Component } from "react"
import {
  Autocomplete,
  AutocompleteResults,
  AutocompleteResultImg,
  SearchIcon,
} from "client/components/autocomplete2/index"
import { clone } from "lodash"
import styled from "styled-components"
import { color, Flex } from "@artsy/palette"

export class AutocompleteInlineList extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    formatSelected: PropTypes.func,
    formatSearchResult: PropTypes.func,
    items: PropTypes.array,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string,
  }

  onRemoveItem = item => {
    const { items, onSelect } = this.props
    const newItems = clone(items)

    newItems.splice(item, 1)
    onSelect(newItems)
  }

  render() {
    const { items } = this.props

    return (
      <List>
        <Flex flexWrap="wrap" mt={0.5}>
          {items.map((item, i) => {
            return (
              <ListItem key={i} width="initial" height="fit-content">
                {item}
                <button
                  className="remove-button"
                  onClick={() => this.onRemoveItem(i)}
                />
              </ListItem>
            )
          })}
        </Flex>

        <Autocomplete {...this.props} />
      </List>
    )
  }
}

AutocompleteInlineList.defaultProps = { items: [] }

const List = styled(Flex)`
  border: 1px solid ${color("black10")};
  position: relative;
  padding: 5px 10px 0 10px;

  ${SearchIcon} {
    display: none;
  }

  input {
    border: none;
    margin: 0;
    padding-left: 0;
    padding-bottom: 0;
    padding-top: 0;
    height: 35px;
  }

  ${AutocompleteResults} {
    left: -1px;
    top: calc(100% + 1px);
    width: calc(100% + 2px);
  }

  ${AutocompleteResultImg} {
    display: none;
  }
`

const ListItem = styled(Flex)`
  align-items: center;
  background: ${color("black10")};
  margin: 0 10px 5px 0px;
  padding: 3px 5px 3px 10px;
  text-transform: capitalize;

  button,
  button:hover {
    position: relative;
    cursor: pointer;
    height: 20px;
    width: 15px;
    margin-left: 5px;
    border: none;
  }
`
