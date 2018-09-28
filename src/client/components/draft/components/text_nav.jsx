import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { flatten, map } from 'lodash'
import { color } from "@artsy/palette"
import colors from '@artsy/reaction/dist/Assets/Colors'
import { IconArtist } from '@artsy/reaction/dist/Components/Publishing/Icon/IconArtist'
import { IconBlockquote } from '@artsy/reaction/dist/Components/Publishing/Icon/IconBlockquote'
import { IconClearFormatting } from '@artsy/reaction/dist/Components/Publishing/Icon/IconClearFormatting'
import { IconLink } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLink'
import { IconOrderedList } from '@artsy/reaction/dist/Components/Publishing/Icon/IconOrderedList'
import { IconUnorderedList } from '@artsy/reaction/dist/Components/Publishing/Icon/IconUnorderedList'
import {
  getVisibleSelectionRect
} from 'draft-js'

const BUTTON_WIDTH = 50
const BUTTON_HEIGHT = 40

export class TextNav extends React.Component {
  componentWillMount() {
    // Get position of pop-up controls from selection and parent location
    const selectionPosition = getVisibleSelectionRect(window)
    this.setState({ selectionPosition })
  }

  onToggle = action => {
    const {
      allowedBlocks,
      allowedStyles,
      promptForLink,
      toggleBlock,
      togglePlainText,
      toggleStyle
    } = this.props

    if (Array.from(allowedBlocks.keys()).includes(action)) {
      return toggleBlock(action)
    }
    if (map(allowedStyles, 'name').includes(action)) {
      return toggleStyle(action)
    }

    switch (action) {
      case 'artist': {
        return promptForLink(action)
      }
      case 'link': {
        return promptForLink()
      }
      case 'clear-formatting': {
        return togglePlainText()
      }
    }
  }

  getButtonsFromBlockMap = () => {
    const { allowedBlocks } = this.props
    const buttons = []

    if (allowedBlocks.get('header-one')) {
      buttons.push({
        element: 'h1',
        name: 'header-one'
      })
    }
    if (allowedBlocks.get('header-two')) {
      buttons.push({
        element: 'h2',
        name: 'header-two'
      })
    }
    if (allowedBlocks.get('header-three')) {
      buttons.push({
        element: 'h3',
        name: 'header-three'
      })
    }
    if (allowedBlocks.get('blockquote')) {
      buttons.push({
        name: 'blockquote'
      })
    }
    if (allowedBlocks.get('ordered-list-item')) {
      buttons.push({
        name: 'ordered-list-item'
      })
    }
    if (allowedBlocks.get('unordered-list-item')) {
      buttons.push({
        name: 'unordered-list-item'
      })
    }
    return buttons
  }

  getButtonArray() {
    const {
      allowedBlocks,
      allowedStyles,
      hasFeatures,
      promptForLink,
      togglePlainText
    } = this.props
    const buttons = []

    if (allowedStyles) {
      buttons.push(allowedStyles)
    }
    if (allowedBlocks) {
      buttons.push(this.getButtonsFromBlockMap())
    }
    if (promptForLink) {
      buttons.push({ name: 'link' })
    }
    if (hasFeatures && promptForLink) {
      buttons.push({ name: 'artist' })
    }
    if (togglePlainText) {
      buttons.push({ name: 'clear-formatting' })
    }

    return flatten(buttons)
  }

  getIcon(type) {
    const props = { color: colors.grayDark }

    switch (type) {
      case 'artist': {
        return <IconArtist {...props} />
      }
      case 'blockquote': {
        return <IconBlockquote {...props} />
      }
      case 'link': {
        return <IconLink {...props} />
      }
      case 'ordered-list-item': {
        return <IconOrderedList {...props} />
      }
      case 'clear-formatting': {
        return <IconClearFormatting {...props} />
      }
      case 'unordered-list-item': {
        return <IconUnorderedList {...props} />
      }
    }
  }

  stickyControlsBox = () => {
    const { editorPosition } = this.props
    const { selectionPosition } = this.state

    const navDimensions = this.getNavDimensions()
    const top = selectionPosition.top - editorPosition.top - navDimensions.height
    const left = selectionPosition.left - editorPosition.left + (selectionPosition.width / 2) - (navDimensions.width / 2)

    return { top, left }
  }

  getNavDimensions = () => {
    const buttons = this.getButtonArray()

    let width = buttons.length * BUTTON_WIDTH
    let height = BUTTON_HEIGHT

    if (buttons.length > 5) {
      // account for wrapping
      width = buttons.length * (BUTTON_WIDTH / 2)
      height = BUTTON_HEIGHT * 2
    }
    return {
      height,
      width
    }
  }

  render() {
    const { top, left } = this.stickyControlsBox()
    const buttons = this.getButtonArray()

    return (
      <TextNavContainer top={top} left={left}>
        {buttons.map((button, i) =>
          <StyleButton
            key={i}
            className={button.name.toLowerCase()}
            onMouseDown={e => this.onToggle(button.name)}
            type={button.name}
          >
            {button.element
              ? button.element
              : this.getIcon(button.name)
            }
          </StyleButton>
        )}
      </TextNavContainer>
    )
  }
}

TextNav.propTypes = {
  allowedBlocks: PropTypes.object,
  allowedStyles: PropTypes.array,
  editorPosition: PropTypes.any,
  hasFeatures: PropTypes.bool,
  position: PropTypes.object,
  promptForLink: PropTypes.func,
  toggleBlock: PropTypes.func,
  togglePlainText: PropTypes.func,
  toggleStyle: PropTypes.func.isRequired
}

const TextNavContainer = styled.div`
  max-width: 250px;
  background: ${color('black100')};
  border-radius: 5px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  z-index: 10;
  position: absolute;
  left: ${props => props.left}px;
  top: ${props => props.top}px;

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 7px solid ${color('black100')};
    position: absolute;
    bottom: -7px;
    left: calc(50% - 7px);
  }
`

const StyleButton = styled.div`
  color: ${color('black30')};
  height: ${BUTTON_HEIGHT}px;
  width: ${BUTTON_WIDTH}px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 20px;

  svg {
    width: 18px;
    height: 18px;
    g {
      fill: ${color('black30')};
    }
  }

  &:hover {
    opacity: .65;
  }

  ${props => props.type === 'BOLD' && `
    font-style: bold;
  `}

  ${props => props.type === 'ITALIC' && `
    font-style: italic;
  `}

  ${props => props.type === 'STRIKETHROUGH' && `
    text-decoration: line-through;
  `}

  ${props => props.type === 'UNDERLINE' && `
    text-decoration: underline;
  `}
`
