import { Editor, EditorState, RichUtils } from 'draft-js'
import { debounce } from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { TextInputUrl } from '../components/text_input_url'
import { TextNav } from '../components/text_nav'
import { convertDraftToHtml, convertHtmlToDraft } from './utils/convert'
import { decorators } from './utils/decorators'
import { confirmLink, linkDataFromSelection, removeLink } from './utils/links'
import { AllowedStyles, StyleMap } from './utils/typings'
import {
  blockMapFromNodes,
  blockNamesFromMap,
  handleReturn,
  insertPastedState,
  keyBindingFn,
  makePlainText,
  styleMapFromNodes,
  styleNamesFromMap,
} from './utils/utils'

/**
 * TODO: new description
 */

interface Props {
  allowedBlocks?: any
  allowedStyles?: AllowedStyles
  html?: string
  hasLinks: boolean
  hasFollowButton: boolean
  handleBlockquote?: (html: string) => void
  handleReturn?: (editorState: EditorState, html: string) => void
  onChange: (html: string) => void
  placeholder?: string
  isDark?: boolean
}

interface State {
  editorState: EditorState
  html: string
  editorPosition: any
  showNav: boolean
  showUrlInput: boolean
  urlValue: string
  urlIsFollow: boolean
}

export class RichText extends Component<Props, State> {
  private editor
  private allowedBlocks: any
  private allowedStyles: StyleMap
  private debouncedOnChange

  static defaultProps = {
    hasFollowButton: false,
    hasLinks: false,
  }

  constructor(props: Props) {
    super(props)
    this.allowedStyles = styleMapFromNodes(props.allowedStyles)
    this.allowedBlocks = blockMapFromNodes(props.allowedBlocks)

    this.state = {
      editorState: this.setEditorState(),
      editorPosition: null,
      html: props.html || '',
      showNav: false,
      showUrlInput: false,
      urlValue: '',
      urlIsFollow: false,
    }

    this.debouncedOnChange = debounce(html => {
      props.onChange(html)
    }, 250)
  }

  setEditorState = () => {
    const { hasLinks, html } = this.props

    if (html) {
      return this.editorStateFromHTML(html)
    } else {
      return EditorState.createEmpty(decorators(hasLinks))
    }
  }

  editorStateToHTML = editorState => {
    const { hasFollowButton } = this.props
    const currentContent = editorState.getCurrentContent()

    return convertDraftToHtml(
      currentContent,
      this.allowedBlocks,
      this.allowedStyles,
      hasFollowButton
    )
  }

  editorStateFromHTML = html => {
    const { hasLinks } = this.props
    const contentBlocks = convertHtmlToDraft(
      html,
      hasLinks,
      this.allowedBlocks,
      this.allowedStyles
    )

    return EditorState.createWithContent(contentBlocks, decorators(hasLinks))
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
    // Maybe split-block, and don't create consecutive empty paragraphs
    return handleReturn(e, editorState, this.props.handleReturn)
  }

  handleKeyCommand = command => {
    const { hasLinks } = this.props

    switch (command) {
      case 'link-prompt': {
        if (hasLinks) {
          // Open link input if links are supported
          return this.promptForLink()
        }
        break
      }
      case 'blockquote':
      case 'header-one':
      case 'header-two':
      case 'header-three': {
        return this.keyCommandBlockType(command)
      }
      case 'bold':
      case 'italic':
      case 'underline': {
        return this.keyCommandInlineStyle(command)
      }
      case 'strikethrough': {
        // Not handled by draft's handleKeyCommand, use toggleBlockType instead
        this.toggleInlineStyle(command.toUpperCase())
        return 'handled'
      }
      case 'plain-text': {
        this.makePlainText()
        return 'handled'
      }
    }
    // let draft defaults or browser handle
    return 'not-handled'
  }

  keyCommandBlockType = command => {
    // Handle block changes from key command
    // const { handleBlockquote } = this.props
    const { editorState } = this.state
    const blocks = blockNamesFromMap(this.allowedBlocks)

    if (blocks.includes(command)) {
      const newState = RichUtils.toggleBlockType(editorState, command)

      // If an updated state is returned, command is handled
      if (newState) {
        this.onChange(newState)

        if (command === 'blockquote') {
          // handleBlockquote()
          // maybe call this from parent after change?
        }
        return 'handled'
      }
    } else {
      return 'not-handled'
    }
  }

  toggleBlockType = command => {
    // Handle block type changes from menu click
    const { editorState } = this.state
    const blocks = blockNamesFromMap(this.allowedBlocks)
    let newState

    if (blocks.includes(command)) {
      newState = RichUtils.toggleBlockType(editorState, command)
    }
    if (newState) {
      this.onChange(newState)
      if (command === 'blockquote') {
        // handleBlockquote()
        // maybe call this from parent after change?
      }
    }
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
    let newState

    if (styles.includes(command)) {
      newState = RichUtils.toggleInlineStyle(editorState, command)
    }
    if (newState) {
      this.onChange(newState)
    }
  }

  makePlainText = () => {
    const { editorState } = this.state
    const newState = makePlainText(editorState)
    this.onChange(newState)
  }

  handlePastedText = (text, html) => {
    const { editorState } = this.state

    if (!html) {
      // Wrap pasted plain text in html
      html = '<div>' + text + '</div>'
    }
    const stateFromPastedFragment = this.editorStateFromHTML(html)
    const stateWithPastedText = insertPastedState(
      stateFromPastedFragment,
      editorState
    )

    this.onChange(stateWithPastedText)
    return true
  }

  promptForLink = () => {
    // Opens a popup link input populated with selection data if link is selected
    const { editorState } = this.state
    const linkData = linkDataFromSelection(editorState)
    const urlValue = linkData ? linkData.url : ''
    const editorPosition = ReactDOM.findDOMNode(
      this.editor
    ).getBoundingClientRect()

    this.setState({
      editorPosition,
      showUrlInput: true,
      showNav: false,
      urlValue,
    })
    return 'handled'
  }

  confirmLink = url => {
    const { hasFollowButton } = this.props
    const { editorState } = this.state
    const newEditorState = confirmLink(url, editorState, hasFollowButton)

    this.setState({
      showNav: false,
      showUrlInput: false,
      urlValue: '',
    })
    this.onChange(newEditorState)
  }

  removeLink = () => {
    const editorState = removeLink(this.state.editorState)

    if (editorState) {
      this.setState({
        showUrlInput: false,
        urlValue: '',
      })
      this.onChange(editorState)
    }
  }

  checkSelection = () => {
    let editorPosition: any = null
    let showNav = false
    const hasSelection = !window.getSelection().isCollapsed

    if (hasSelection) {
      showNav = true
      editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
    }
    this.setState({ editorPosition, showNav })
  }

  render() {
    const { hasLinks, isDark, placeholder } = this.props
    const {
      editorState,
      editorPosition,
      showNav,
      showUrlInput,
      urlValue,
    } = this.state
    const promptForLink = hasLinks ? this.promptForLink : undefined

    return (
      <RichTextContainer>
        {showNav && (
          <TextNav
            allowedBlocks={this.allowedBlocks}
            allowedStyles={this.allowedStyles}
            editorPosition={editorPosition}
            onClickOff={() => this.setState({ showNav: false })}
            promptForLink={promptForLink}
            toggleBlock={this.toggleBlockType}
            togglePlainText={this.makePlainText}
            toggleStyle={this.toggleInlineStyle}
          />
        )}
        {showUrlInput && (
          <TextInputUrl
            backgroundColor={isDark ? 'white' : undefined}
            confirmLink={this.confirmLink}
            editorPosition={editorPosition}
            onClickOff={() => this.setState({ showUrlInput: false })}
            removeLink={this.removeLink}
            urlValue={urlValue}
          />
        )}
        <div
          onClick={this.focus}
          onMouseUp={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            blockRenderMap={this.allowedBlocks as any}
            editorState={editorState}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={this.handleKeyCommand as any}
            handlePastedText={this.handlePastedText as any}
            handleReturn={this.handleReturn}
            onChange={this.onChange}
            placeholder={placeholder}
            ref={ref => {
              this.editor = ref
            }}
            spellCheck
          />
        </div>
      </RichTextContainer>
    )
  }
}

const RichTextContainer = styled.div`
  position: relative;
`
