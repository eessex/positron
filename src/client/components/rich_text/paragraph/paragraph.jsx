import Immutable from 'immutable'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import {
  Editor,
  EditorState,
  RichUtils
} from 'draft-js'
import { Text } from '@artsy/reaction/dist/Components/Publishing'
import { TextNav } from '../components/text_nav'
import { stickyControlsBox } from '../utils/text_selection'
import {
  confirmLink,
  linkDataFromSelection,
  removeLink
} from '../utils/links'
import {
  stripGoogleStyles,
  stripParagraphLinebreaks
 } from '../utils/text_stripping'
import { TextInputUrl } from '../components/input_url.jsx'
import * as Config from '../utils/config'

import {
  entityToHTML,
  handleReturn,
  htmlToBlock,
  htmlToEntity,
  htmlToStyle,
  insertPastedState,
  keyBindingFn,
  styleToHTML,
  styleMapFromNames,
  styleNamesFromMap
} from './utils'

/*
  Supports HTML with bold and italic styles in <p> blocks.
  Optionally supports links, and linebreak stripping.
  Styles are determined by props for article layout,
  or limit commands by passing allowedStyles.
*/

export class Paragraph extends Component {
  static editor
  static propTypes = {
    allowedStyles: PropTypes.array,
    html: PropTypes.string,
    layout: PropTypes.string,
    linked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    stripLinebreaks: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.allowedStyles = styleMapFromNames(props.allowedStyles)

    this.state = {
      editorState: this.setEditorState(),
      html: props.html || '',
      selectionTarget: null,
      showNav: false,
      showUrlInput: false,
      urlValue: ''
    }

    this.debouncedOnChange = debounce((html) => {
      props.onChange(html)
    }, 250)
  }

  setEditorState = () => {
    const { linked, html } = this.props

    if (html) {
      return this.editorStateFromHTML(html)
    } else {
      if (linked) {
        return EditorState.createEmpty(
          Config.decorators(linked)
        )
      } else {
        return EditorState.createEmpty()
      }
    }
  }

  editorStateToHTML = editorState => {
    const { stripLinebreaks } = this.props
    const styles = styleNamesFromMap(this.allowedStyles)

    const currentContent = editorState.getCurrentContent()
    const html = convertToHTML({
      entityToHTML,
      styleToHTML: style => styleToHTML(style, styles),
      blockToHTML: ({ type }) => {
        // TODO: Fix type switching from draft-convert to avoid weird if statement
        if (type === 'ordered-list-item') {
          return {
            start: '<p>',
            end: '</p>',
            nestStart: '',
            nestEnd: ''
          }
        }
        if (type === 'unordered-list-item') {
          return {
            start: '<p>',
            end: '</p>',
            nestStart: '',
            nestEnd: ''
          }
        } else {
          return {
            start: '<p>',
            end: '</p>'
          }
        }
      }
    })(currentContent)
    if (stripLinebreaks) {
      return stripParagraphLinebreaks(html)
    } else {
      return html
    }
  }

  editorStateFromHTML = html => {
    const { linked } = this.props
    let cleanedHtml = stripGoogleStyles(html)

    const contentBlocks = convertFromHTML({
      htmlToBlock,
      htmlToEntity: linked ? htmlToEntity : undefined,
      htmlToStyle: (nodeName, node, currentStyle) => {
        return htmlToStyle(nodeName, node, currentStyle, this.allowedStyles)
      }
    })(cleanedHtml)

    return EditorState.createWithContent(
      contentBlocks,
      Config.decorators(linked)
    )
  }

  onChange = editorState => {
    const html = this.editorStateToHTML(editorState)

    this.setState({ editorState, html })
    if (html !== this.props.html) {
      // Return html if changed
      this.debouncedOnChange(html)
    }
  }

  focus = () => {
    this.editor.focus()
  }

  handleReturn = e => {
    const { editorState } = this.state
    const { stripLinebreaks } = this.props

    if (stripLinebreaks) {
      // Do nothing if linebreaks are disallowed
      return 'handled'
    } else {
      // Maybe split-block, but don't create empty paragraphs
      return handleReturn(e, editorState)
    }
  }

  handleKeyCommand = command => {
    const { linked } = this.props

    switch (command) {
      case 'link-prompt': {
        if (linked) {
          // Open link input if links are supported
          return this.promptForLink()
        }
        break
      }
      case 'bold':
      case 'italic': {
        return this.keyCommandInlineStyle(command)
      }
    }
    // let draft defaults or browser handle
    return 'not-handled'
  }

  keyCommandInlineStyle = command => {
    // Handle style changes from key command
    const { editorState } = this.state
    const styles = styleNamesFromMap(this.allowedStyles)

    if (styles.includes(command.toUpperCase())) {
      const newState = RichUtils.handleKeyCommand(editorState, command)

      // If an updated state is returned, command is handled
      if (newState) {
        this.onChange(newState)
        return 'handled'
      }
    } else {
      return 'not-handled'
    }
  }

  toggleInlineStyle = command => {
    // Handle style changes from menu click
    const { editorState } = this.state
    const styles = styleNamesFromMap(this.allowedStyles)
    let newEditorState

    if (styles.includes(command)) {
      newEditorState = RichUtils.toggleInlineStyle(editorState, command)
    }
    if (newEditorState) {
      this.onChange(newEditorState)
    }
  }

  handlePastedText = (text, html) => {
    const { editorState } = this.state

    if (!html) {
      // Wrap pasted plain text in html
      html = '<p>' + text + '</p>'
    }
    const stateFromPastedFragment = this.editorStateFromHTML(html)
    const stateWithPastedText = insertPastedState(stateFromPastedFragment, editorState)
    // Convert back to HTML to clear disallowed styles/blocks
    // const allowedHtml = this.editorStateToHTML(stateWithPastedText)
    // const cleanedEditorState = this.editorStateFromHTML(allowedHtml)

    this.onChange(stateWithPastedText)
    return true
  }

  promptForLink = () => {
    const { editorState } = this.state
    const linkData = linkDataFromSelection(editorState)
    const urlValue = linkData ? linkData.url : ''
    const editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
    const selectionTarget = stickyControlsBox(editorPosition, 25, 200)

    this.setState({
      selectionTarget,
      showUrlInput: true,
      showNav: false,
      urlValue
    })
    return 'handled'
  }

  confirmLink = url => {
    const { editorState } = this.state
    const newEditorState = confirmLink(url, editorState)

    this.setState({
      selectionTarget: null,
      showNav: false,
      showUrlInput: false,
      urlValue: ''
    })
    this.onChange(newEditorState)
  }

  removeLink = () => {
    const editorState = removeLink(this.state.editorState)

    if (editorState) {
      this.setState({
        editorState,
        showUrlInput: false,
        urlValue: ''
      })
    }
  }

  checkSelection = () => {
    const { linked } = this.props
    let selectionTarget = null
    let showNav = false

    const hasSelection = !window.getSelection().isCollapsed
    const stylesLength = this.allowedStyles.length
    const buttonsLength = linked ? stylesLength + 1 : stylesLength
    const buttonWidth = 25
    const menuHeight = -45
    const selectionTargetLeft = buttonsLength * buttonWidth

    if (hasSelection) {
      showNav = true
      const editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
      selectionTarget = stickyControlsBox(editorPosition, menuHeight, selectionTargetLeft)
    }
    this.setState({ showNav, selectionTarget })
  }

  render () {
    const { layout, linked, placeholder } = this.props
    const {
      editorState,
      selectionTarget,
      showNav,
      showUrlInput,
      urlValue
    } = this.state
    const promptForLink = linked ? this.promptForLink : undefined

    return (
      <Text layout={layout || 'classic'}>
        {showNav &&
          <TextNav
            onClickOff={() => this.setState({ showNav: false })}
            position={selectionTarget}
            promptForLink={promptForLink}
            styles={this.allowedStyles}
            toggleStyle={this.toggleInlineStyle}
          />
        }
        {showUrlInput &&
          <TextInputUrl
            confirmLink={this.confirmLink}
            onClickOff={() => this.setState({ showUrlInput: false })}
            removeLink={this.removeLink}
            selectionTarget={selectionTarget}
            urlValue={urlValue}
          />
        }
        <div
          onClick={this.focus}
          onMouseUp={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            blockRenderMap={blockRenderMap}
            editorState={editorState}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={this.handleKeyCommand}
            handlePastedText={this.handlePastedText}
            handleReturn={this.handleReturn}
            onChange={this.onChange}
            placeholder={placeholder || 'Start typing...'}
            ref={ref => { this.editor = ref }}
            spellCheck
          />
        </div>
      </Text>
    )
  }
}

/*
  blockRenderMap determines which kinds of HTML blocks are
  allowed by the editor. Below, blocks are limited to the
  default 'unstyled', which @editorStateToHTML converts to <p>.

  Blocks are limited below to prevents users from pasting text
  with blocks that the editor's default key commands cannot handle.

  The element is 'div' because Draft.js nests additional
  <div> tags as children to each block, and <p> tags throw
  a console error if they have <div>'s as children.
*/
const blockRenderMap = Immutable.Map({
  'unstyled': {
    element: 'div'
  }
})
