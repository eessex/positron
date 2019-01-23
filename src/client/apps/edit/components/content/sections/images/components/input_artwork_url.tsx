import { Button, Flex } from "@artsy/palette"
import { Input, StyledInput } from "@artsy/reaction/dist/Components/Input"
import { last } from "lodash"
import React, { Component } from "react"
import styled from "styled-components"

interface ArtworkUrlProps {
  addArtwork: (artwork: any) => void
  disabled?: boolean
  fetchArtwork: (id: string) => void
}

interface ArtworkUrlState {
  isLoading: boolean
  url: string
}

export class InputArtworkUrl extends Component<
  ArtworkUrlProps,
  ArtworkUrlState
> {
  state = {
    isLoading: false,
    url: "",
  }

  getIdFromSlug = url => {
    const id = last(url.split("/"))

    if (id.length) {
      this.setState({ isLoading: true })
      this.addArtwork(id)
    }
  }

  addArtwork = async id => {
    const { addArtwork, fetchArtwork } = this.props
    const isLoading = false

    try {
      const artwork = await fetchArtwork(id)
      addArtwork(artwork)
      this.setState({ isLoading, url: "" })
    } catch (error) {
      this.setState({ isLoading })
    }
  }

  render() {
    const { disabled } = this.props
    const { isLoading, url } = this.state
    // TODO: export input container

    return (
      <InputArtworkUrlContainer>
        <Input
          block
          disabled={disabled}
          placeholder="Add artwork url"
          value={url}
          onChange={e => this.setState({ url: e.currentTarget.value })}
          onKeyUp={e => {
            if (e.key === "Enter") {
              this.getIdFromSlug(url)
            }
          }}
        />
        <Button
          onClick={() => this.getIdFromSlug(url)}
          variant="secondaryGray"
          loading={isLoading}
          mt={1}
          borderRadius={0}
        >
          Add
        </Button>
      </InputArtworkUrlContainer>
    )
  }
}

const InputArtworkUrlContainer = styled(Flex)`
  ${StyledInput} {
    flex: 1;
  }
  button {
    height: 40px;
  }
`
