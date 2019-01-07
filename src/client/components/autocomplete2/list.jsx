import styled from "styled-components"
import { clone, map, uniq } from "lodash"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { Autocomplete } from "/client/components/autocomplete2/index"
import { color, Box, Flex, Sans, Serif } from "@artsy/palette"

export class AutocompleteList extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    fetchItems: PropTypes.func,
    formatSelected: PropTypes.func,
    formatListItem: PropTypes.func,
    formatSearchResult: PropTypes.func,
    items: PropTypes.array,
    label: PropTypes.string,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string,
  }

  state = {
    items: [],
  }

  componentWillMount = () => {
    this.fetchItems()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.items !== this.props.items) {
      this.fetchItems()
    }
  }

  fetchItems = () => {
    const { fetchItems } = this.props
    const { items } = this.state

    fetchItems(items, fetchedItems => {
      this.setState({ items: fetchedItems })
    })
  }

  onRemoveItem = item => {
    const { onSelect } = this.props
    const { items } = this.state
    const newItems = clone(items)
    let newItemsIds

    newItems.splice(item, 1)
    if (newItems.length && newItems[0]._id) {
      newItemsIds = map(newItems, "_id")
    } else {
      newItemsIds = map(newItems, "id")
    }
    onSelect(uniq(newItemsIds))
    this.setState({ items: newItems })
  }

  render() {
    const { formatListItem, label } = this.props
    const { items } = this.state

    return (
      <div>
        {label && (
          <Sans size="3t" weight="medium">
            {label}
          </Sans>
        )}
        {items.length > 0 && (
          <Box mt={1}>
            {items.map((item, i) => {
              const title = item ? item.title || item.name : ""
              return (
                <ListItem key={i}>
                  {formatListItem ? (
                    formatListItem()
                  ) : (
                    <Serif size="4t" color={color("purple100")}>
                      {title}
                    </Serif>
                  )}
                  <button
                    className="remove-button"
                    onClick={() => this.onRemoveItem(i)}
                  />
                </ListItem>
              )
            })}
          </Box>
        )}
        <Autocomplete {...this.props} />
      </div>
    )
  }
}

export const ListItem = styled(Flex)`
  border: 1px solid ${color("black10")};
  position: relative;
  padding: 10px 10px 10px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: space-between;

  button,
  button:hover {
    top: 3px;
  }
`
