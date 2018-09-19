import PropTypes from 'prop-types'
import React from 'react'
import { flatten, map } from 'lodash'
import colors from '@artsy/reaction/dist/Assets/Colors'
import { IconArtist } from '@artsy/reaction/dist/Components/Publishing/Icon/IconArtist'
import { IconBlockquote } from '@artsy/reaction/dist/Components/Publishing/Icon/IconBlockquote'
import { IconClearFormatting } from '@artsy/reaction/dist/Components/Publishing/Icon/IconClearFormatting'
import { IconLink } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLink'
import { IconOrderedList } from '@artsy/reaction/dist/Components/Publishing/Icon/IconOrderedList'
import { IconUnorderedList } from '@artsy/reaction/dist/Components/Publishing/Icon/IconUnorderedList'

export class TextNav extends React.Component {
  onToggle = (e, action) => {
    e.preventDefault()

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

  getNavWidth = () => {
    const buttons = this.getButtonArray()
    return (buttons.length * 50) + 'px'
  }

  render() {
    const { top, left } = this.props.position
    const buttons = this.getButtonArray()

    return (
      <div
        className='TextNav'
        style={{
          top: top,
          marginLeft: left,
          width: this.getNavWidth()
        }}
      >
        {buttons.map((button, i) =>
          <button
            key={i}
            className={button.name.toLowerCase()}
            onMouseDown={(e) => this.onToggle(e, button.name)}
          >
            {button.element
              ? button.element
              : this.getIcon(button.name)
            }
          </button>
        )}
      </div>
    )
  }
}

TextNav.propTypes = {
  allowedBlocks: PropTypes.object,
  allowedStyles: PropTypes.array,
  hasFeatures: PropTypes.bool,
  position: PropTypes.object,
  promptForLink: PropTypes.func,
  toggleBlock: PropTypes.func,
  togglePlainText: PropTypes.func,
  toggleStyle: PropTypes.func.isRequired
}
