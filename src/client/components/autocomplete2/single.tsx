import { Box, color, Sans, Serif } from "@artsy/palette"
import { Autocomplete, Item } from "client/components/autocomplete2/index"
import React, { Component, ReactNode } from "react"
import { ListItem } from "./list"
import { AutocompleteListProps } from "./list_metaphysics"

interface AutocompleteSingleProps extends AutocompleteListProps {
  item?: Item
  fetchItem: (item?: Item | null, cb?: (item: Item[]) => void) => void
  formatListItem?: () => ReactNode
}

interface AutocompleteSingleState {
  item?: Item
}

export class AutocompleteSingle extends Component<
  AutocompleteSingleProps,
  AutocompleteSingleState
> {
  state = {
    item: undefined,
  }

  componentWillMount = () => {
    this.fetchItem()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.item !== this.props.item) {
      this.fetchItem()
    }
  }

  fetchItem = () => {
    const { fetchItem } = this.props
    const { item } = this.state

    fetchItem(item, fetchedItems => {
      this.setState({ item: fetchedItems[0] })
    })
  }

  onRemoveItem = () => {
    const { onSelect } = this.props
    this.setState({ item: undefined })
    onSelect(null)
  }

  onSelect = items => {
    const { onSelect } = this.props
    this.setState({ item: items[0] })
    onSelect(items[0])
  }

  render() {
    const { formatListItem, label } = this.props
    const { item } = this.state

    const props = {
      ...this.props,
      items: item ? [item] : undefined,
      onSelect: this.onSelect,
    }

    const title = item ? item.title || item.name : ""
    return (
      <div>
        {label && (
          <Sans size="3t" weight="medium">
            {label}
          </Sans>
        )}
        {item ? (
          <Box mt={2}>
            <ListItem>
              {formatListItem ? (
                formatListItem()
              ) : (
                <Serif size="4t" color={color("purple100")}>
                  {title}
                </Serif>
              )}
              <button
                className="remove-button"
                onClick={() => this.onRemoveItem()}
              />
            </ListItem>
          </Box>
        ) : (
          <Autocomplete {...props} />
        )}
      </div>
    )
  }
}
