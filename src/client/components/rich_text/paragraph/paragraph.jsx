import Immutable from 'immutable'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
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
} from './links'
import { TextInputUrl } from '../components/input_url'
import {
  handleReturn,
  insertPastedState,
  keyBindingFn,
  styleMapFromNames,
  styleNamesFromMap
} from './utils'
import { decorators } from './decorators'
import { convertDraftToHtml, convertHtmlToDraft } from './convert'

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
      return EditorState.createEmpty(
        decorators(linked)
      )
    }
  }

  editorStateToHTML = editorState => {
    const { stripLinebreaks } = this.props
    const currentContent = editorState.getCurrentContent()

    return convertDraftToHtml(
      currentContent,
      this.allowedStyles,
      stripLinebreaks
    )
  }

  editorStateFromHTML = html => {
    const { linked } = this.props
    const contentBlocks = convertHtmlToDraft(html, linked, this.allowedStyles)

    return EditorState.createWithContent(
      contentBlocks,
      decorators(linked)
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
    this.checkSelection()
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

    this.onChange(stateWithPastedText)
    return true
  }

  promptForLink = () => {
    const { editorState } = this.state
    const linkData = linkDataFromSelection(editorState)
    const urlValue = linkData ? linkData.url : ''
    const editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
    // TODO: move position calculation to input component
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
    // TODO: move position calculation to input component
    const buttonWidth = 25
    const menuHeight = -45
    const selectionTargetLeft = buttonsLength * buttonWidth

    if (hasSelection) {
      showNav = true
      const editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
      // TODO: Popup component should determine its own size
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
  blockRenderMap determines how HTML blocks are rendered by
  the Editor component. 'unstyled' is equivalent to <p>.

  Element is 'div' because draft nests <div> tags with text,
  and <p> tags cannot have nested children.
*/

const blockRenderMap = Immutable.Map({
  'unstyled': {
    element: 'div'
  }
})
