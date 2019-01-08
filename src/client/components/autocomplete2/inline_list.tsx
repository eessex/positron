import { color, Flex, Sans } from "@artsy/palette"
import { Button } from "@artsy/palette"
import { IconRemove } from "@artsy/reaction/dist/Components/Publishing/Icon/IconRemove"
import {
  Autocomplete,
  AutocompleteProps,
  AutocompleteResultImg,
  AutocompleteResults,
  SearchIcon,
} from "client/components/autocomplete2/index"
import { clone } from "lodash"
import React, { Component } from "react"
import styled from "styled-components"

export class AutocompleteInlineList extends Component<AutocompleteProps> {
  static defaultProps = { items: [] }

  onRemoveItem = item => {
    const { items, onSelect } = this.props
    const newItems = clone(items)

    newItems.splice(item, 1)
    onSelect(newItems)
  }

  render() {
    const { items } = this.props

    return (
      <List mt="10px">
        <Flex flexWrap="wrap" mt="5px">
          {items &&
            items.map((item, i) => {
              return (
                <ListItem key={i}>
                  <Button size="small" variant="secondaryGray" mr={1} mb={1}>
                    <Flex alignItems="center">
                      {item}
                      <IconRemove
                        color="black"
                        background="transparent"
                        onClick={() => this.onRemoveItem(i)}
                      />
                    </Flex>
                  </Button>
                </ListItem>
              )
            })}
        </Flex>

        <Autocomplete {...this.props} />
      </List>
    )
  }
}

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

  svg {
    height: 20px;
  }
`

const ListItem = styled.div`
  ${Sans} {
    text-transform: capitalize;
  }
  button {
    padding-right: 0;
  }
  svg {
    height: 20px;
  }
`
