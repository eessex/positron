import { color } from "@artsy/palette"
import React, { Component } from "react"
import styled from "styled-components"
import { RemoveButton, RemoveButtonContainer } from "../../remove_button"

interface Props {
  backgroundColor?: string
  confirmLink: (url: string, pluginType?: string) => void
  editorPosition: ClientRect | null
  onClickOff: () => void
  pluginType?: "artist"
  removeLink: () => void
  selectionPosition: any
  urlValue: string
}

interface State {
  url: string
}

export class TextInputUrl extends Component<Props, State> {
  state = {
    url: this.props.urlValue || "",
  }

  confirmLink = e => {
    const { confirmLink, pluginType, removeLink } = this.props
    const url = e.target.value || this.state.url

    e.preventDefault()
    if (url.length) {
      confirmLink(url, pluginType)
    } else {
      removeLink()
    }
  }

  onKeyDown = e => {
    switch (e.key) {
      case "Enter": {
        return this.confirmLink(e)
      }
      case "Escape": {
        return this.props.onClickOff()
      }
      case "Tab": {
        return this.onExitInput(e)
      }
    }
  }

  onExitInput = e => {
    const { onClickOff, removeLink, urlValue } = this.props

    if (e.target.value.length > 0) {
      // Link was edited
      this.confirmLink(e)
    } else if (urlValue) {
      // Link was deleted
      removeLink()
    } else {
      // No change, close the menu
      onClickOff()
    }
  }

  stickyControlsBox = () => {
    const { editorPosition, selectionPosition } = this.props
    const inputHeight = 25
    const inputWidth = 350
    let top
    let left

    if (editorPosition && selectionPosition) {
      top = selectionPosition.top - editorPosition.top - inputHeight
      left =
        selectionPosition.left -
        editorPosition.left +
        selectionPosition.width / 2 -
        inputWidth / 2
    }
    return { top, left }
  }

  render() {
    const { url } = this.state
    const { backgroundColor, onClickOff, removeLink } = this.props
    const { top, left } = this.stickyControlsBox()

    return (
      <div>
        <BackgroundOverlay onClick={onClickOff} />

        <TextInputUrlContainer color={backgroundColor} top={top} left={left}>
          <InputContainer>
            <Input
              autoFocus
              className="bordered-input"
              value={url}
              onChange={e => this.setState({ url: e.target.value })}
              placeholder="Paste or type a link"
              onKeyDown={this.onKeyDown}
            />

            {url.length > 0 && (
              <RemoveButton
                onMouseDown={removeLink}
                background={color("black30")}
              />
            )}
          </InputContainer>

          <Button
            onClick={this.confirmLink}
            // size="2"
            // weight='medium'
            // color={color("black100")}
          >
            Apply
          </Button>
        </TextInputUrlContainer>
      </div>
    )
  }
}

const TextInputUrlContainer = styled.div.attrs<{ top: number; left: number }>(
  {}
)`
  top: ${props => `${props.top + 5}px` || 0};
  left: ${props => `${props.left}px` || 0};
  position: absolute;
  background-color: ${props => (props.color ? props.color : color("black100"))};
  color: ${color("black100")};
  height: 50px;
  width: 350px;
  padding: 10px;
  display: flex;
  z-index: 10;
  &::after {
    content: "";
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid
      ${props => (props.color ? props.color : color("black100"))};
    position: absolute;
    top: -7px;
    left: 50%;
  }
`

const Input = styled.input`
  background-color: white;
  width: 260px;
  height: 30px;
  font-size: 15px;
  padding-right: 35px;
  padding-left: 5px;
`

const InputContainer = styled.div`
  position: relative;
  ${RemoveButtonContainer} {
    position: absolute;
    right: 10px;
    width: 20px;
    height: 20px;
    top: 5px;
  }
`

export const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 7;
`

export const Button = styled.div.attrs<{ onClick: (e: any) => void }>({})`
  width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s;
  background: ${color("black10")};
  &:hover {
    color: ${color("purple100")};
  }
`

// export const Button = styled(Sans).attrs<{ onClick: (e: any) => void }>({})`
//   width: 70px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   cursor: pointer;
//   transition: color .15s;
//   background: ${color('black10')};
//   &:hover {
//     color: ${color('purple100')};
//   }
// `
