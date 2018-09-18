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
      blocks,
      makePlainText,
      promptForLink,
      styles,
      toggleBlock,
      toggleStyle
    } = this.props

    if (Array.from(blocks.keys()).includes(action)) {
      return toggleBlock(action)
    }
    if (map(styles, 'name').includes(action)) {
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
        return makePlainText()
      }
    }
  }

  getButtonsFromBlockMap = () => {
    const { blocks } = this.props
    const buttons = []

    if (blocks.get('header-one')) {
      buttons.push({
        element: 'h1',
        name: 'header-one'
      })
    }
    if (blocks.get('header-two')) {
      buttons.push({
        element: 'h2',
        name: 'header-two'
      })
    }
    if (blocks.get('header-three')) {
      buttons.push({
        element: 'h3',
        name: 'header-three'
      })
    }
    if (blocks.get('blockquote')) {
      buttons.push({
        name: 'blockquote'
      })
    }
    if (blocks.get('ordered-list-item')) {
      buttons.push({
        name: 'ordered-list-item'
      })
    }
    if (blocks.get('unordered-list-item')) {
      buttons.push({
        name: 'unordered-list-item'
      })
    }
    return buttons
  }

  getButtonArray() {
    const {
      blocks,
      hasFeatures,
      makePlainText,
      promptForLink,
      styles
    } = this.props
    const buttons = []

    if (styles) {
      buttons.push(styles)
    }
    if (blocks) {
      buttons.push(this.getButtonsFromBlockMap())
    }
    if (promptForLink) {
      buttons.push({ name: 'link' })
    }
    if (hasFeatures && promptForLink) {
      buttons.push({ name: 'artist' })
    }
    if (makePlainText) {
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
  blocks: PropTypes.array,
  hasFeatures: PropTypes.bool,
  makePlainText: PropTypes.func,
  position: PropTypes.object,
  promptForLink: PropTypes.func,
  styles: PropTypes.array,
  toggleBlock: PropTypes.func,
  toggleStyle: PropTypes.func.isRequired
}
