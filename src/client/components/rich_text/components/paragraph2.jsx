import Immutable from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Text } from '@artsy/reaction/dist/Components/Publishing'
import {
  convertFromHTML,
  convertToHTML
} from 'draft-convert'
import {
  Editor,
  EditorState,
  RichUtils
} from 'draft-js'
import * as Config from '../utils/config'
import { TextNav } from './text_nav'
import { stickyControlsBox } from '../utils/text_selection.js'
import { TextInputUrl } from './input_url.jsx'

/*
  Accepts HTML with bold, italic, underline and code styles
  Converts editorState to HTML on change
  HTML blocks types are limited to paragraph
*/
export class Paragraph extends Component {
  static editor
  static propTypes = {
    html: PropTypes.string,
    layout: PropTypes.string,
    linked: PropTypes.bool,
    onChange: PropTypes.func,
    type: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      editorState: this.setEditorState(),
      html: props.html || '',
      selectionTarget: null,
      showNav: false,
      showUrlInput: false,
      urlValue: ''
    }
  }

  setEditorState = () => {
    const { html } = this.props

    if (html) {
      return this.editorStateFromHTML(html)
    } else {
      return EditorState.createEmpty()
    }
  }

  editorStateToHtml = editorState => {
    const currentContent = editorState.getCurrentContent()
    return convertToHTML({})(currentContent)
  }

  editorStateFromHTML = html => {
    const contentBlocks = convertFromHTML({})(html)
    return EditorState.createWithContent(contentBlocks)
  }

  onChange = editorState => {
    const { onChange } = this.props
    const html = this.editorStateToHtml(editorState)

    this.setState({ editorState, html })
    if (html !== this.props.html) {
      // Return html if changed
      onChange(html)
    }
  }

  focus = () => {
    this.editor.focus()
  }

  handleKeyCommand = command => {
    const { editorState } = this.state
    const newState = RichUtils.handleKeyCommand(editorState, command)
    // If an updated state is returned, the command is handled

    if (newState) {
      this.onChange(newState)
      return 'handled'
    }
    // Otherwise let the browser handle it
    return 'not-handled'
  }

  toggleInlineStyle = inlineStyle => {
    const { editorState } = this.state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, inlineStyle)

    this.onChange(newEditorState)
  }

  hasLinks = () => {
    const { linked, type } = this.props
    return linked || ['caption', 'postscript'].includes(type)
  }

  promptForLink = () => {
    const { editorState } = this.state
    const urlValue = this.getSelectionLinkData(editorState) || ''
    const editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
    const selectionTarget = stickyControlsBox(editorPosition, 25, 200)

    this.setState({
      showUrlInput: true,
      showNav: false,
      urlValue,
      selectionTarget
    })
  }

  getSelectionLinkData = editorState => {
    const contentState = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const startKey = selection.getStartKey()
    const startOffset = selection.getStartOffset()
    const blockWithLink = contentState.getBlockForKey(startKey)
    const linkKey = blockWithLink.getEntityAt(startOffset)

    if (linkKey) {
      const entity = contentState.getEntity(linkKey)
      return entity.getData().url
    }
  }

  confirmLink = () => {
    debugger
  }

  removeLink = () => {
    debugger
  }

  checkSelection = () => {
    let selectionTarget = null
    let showNav = false

    if (this.editor) {
      if (!window.getSelection().isCollapsed) {
        const editorPosition = ReactDOM.findDOMNode(this.editor).getBoundingClientRect()
        let selectionTargetL = Config.inlineStyles(this.props.type).length * 25
        if (this.hasLinks) {
          selectionTargetL = selectionTargetL + 25
        }
        showNav = true
        selectionTarget = stickyControlsBox(editorPosition, -43, selectionTargetL)
      }
    }
    this.setState({ showNav, selectionTarget })
  }

  render () {
    const { layout, type } = this.props
    const {
      editorState,
      selectionTarget,
      showNav,
      showUrlInput,
      urlValue
    } = this.state

    return (
      <Text
        layout={layout || 'classic'}
        postscript={type === 'postscript'}
      >
        {showNav &&
          <TextNav
            position={selectionTarget}
            promptForLink={this.hasLinks ? this.promptForLink : undefined}
            styles={Config.inlineStyles(type)}
            toggleStyle={this.toggleInlineStyle}
          />
        }
        {showUrlInput &&
          <TextInputUrl
            confirmLink={this.confirmLink}
            onClickOff={() => this.setState({showUrlInput: false})}
            removeLink={this.removeLink}
            selectionTarget={selectionTarget}
            urlValue={urlValue}
          />
        }
        <div
          onClick={this.focus}
          onBlur={() => this.setState({showNav: false})}
          onMouseUp={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            blockRenderMap={blockRenderMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder='Click to start typing...'
            ref={(ref) => { this.editor = ref }}
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
  default 'unstyled', which @editorStateToHtml converts to <p>.

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

// # A basic paragraph component: supports bold and italic styles
// # optionally allows links and stripping of linebreaks
// # or format in types 'postscript', 'caption' and 'lead paragraph'

// # Paragraph {
// #   html        *required
// #   onChange    *required
// #   placeholder
// #   layout: article.layout
// #   postscript: default=false
// #   linked: default=false
// #   stripLinebreaks: default=false
// #   type: 'postscript' | 'caption' | 'lead paragraph'
// # }

// React = require 'react'
// ReactDOM = require 'react-dom'
// sd = require('sharify').data
// Config = require '../utils/config.js'
// { keyBindingFnParagraph } = require '../utils/keybindings.js'
// { stickyControlsBox } = require '../utils/text_selection.js'
// { standardizeSpacing, stripCharacterStyles, stripGoogleStyles } = require '../utils/text_stripping.js'
// { ContentState,
//   CompositeDecorator,
//   Editor,
//   EditorState,
//   Entity,
//   RichUtils,
//   Modifier } = require 'draft-js'
// { convertToHTML, convertFromHTML } = require 'draft-convert'
// { div, a } = React.DOM
// editor = (props) -> React.createElement Editor, props
// { Text } = require('@artsy/reaction/dist/Components/Publishing')
// { TextNav } = require './text_nav.jsx'
// { TextInputUrl } = require './input_url.jsx'
// Text = React.createFactory Text

// module.exports = React.createClass
//   displayName: 'Paragraph'

//   getInitialState: ->
//     editorState: EditorState.createEmpty(
//       new CompositeDecorator Config.decorators(@hasLinks())
//     )
//     focus: false
//     showUrlInput: false
//     showNav: false
//     urlValue: ''
//     selectionTarget: null

//   componentDidMount: ->
//     if $(@props.html)?.text().length
//       html = standardizeSpacing @props.html
//       html = @stripLinebreaks(html) if @props.stripLinebreaks
//       blocksFromHTML = @convertFromHTML(html)
//       @setState
//         html: html
//         editorState: EditorState.createWithContent(
//           blocksFromHTML,
//           new CompositeDecorator Config.decorators(@hasLinks())
//         )

//   componentDidUpdate: (prevProps) ->
//     if @props.html != prevProps.html && @props.html != @state.html
//       # re-initialize on drag/drop
//       @componentDidMount()

//   hasLinks: ->
//     return true if @props.linked or @props.type in ['caption', 'postscript']

//   onChange: (editorState) ->
//     html = @convertToHtml editorState
//     currentContentState = @state.editorState.getCurrentContent()
//     newContentState = editorState.getCurrentContent()

//     if currentContentState != newContentState
//       @props.onChange(html)
//     @setState editorState: editorState, html: html

//   focus: ->
//     @setState focus: true
//     @refs.editor.focus()

//   onBlur: ->
//     @setState
//       focus: false
//       showNav: false

//   convertFromHTML: (html) ->
//     html = @stripLinebreaks(html) if @props.stripLinebreaks
//     blocksFromHTML = convertFromHTML({
//       htmlToEntity: (nodeName, node, createEntity) ->
//         if nodeName is 'a'
//           data = {url: node.href}
//           return createEntity(
//             'LINK',
//             'MUTABLE',
//             data
//           )
//       })(html)
//     return blocksFromHTML

//   convertToHtml: (editorState) ->
//     html = convertToHTML({
//       entityToHTML: (entity, originalText) ->
//         if entity.type is 'LINK'
//           return a { href: entity.data.url}
//         return originalText
//     })(editorState.getCurrentContent())
//     html = standardizeSpacing html
//     html = if html in ['<p></p>', '<p><br></p>'] then '' else html
//     return html

//   availableBlocks: ->
//     blockMap = Config.blockRenderMap()
//     available = Object.keys(blockMap.toObject())
//     return Array.from(available)

//   handleKeyCommand: (e) ->
//     return 'handled' if @props.stripLinebreaks is true and e is 'split-block'
//     if e is 'link-prompt'
//       @promptForLink() if @hasLinks()
//       return 'handled'
//     if e in ['bold', 'italic']
//       return 'handled' if @props.type is 'postscript' and e is 'italic'
//       return 'handled' if @props.type is 'caption' and e is 'bold'
//       newState = RichUtils.handleKeyCommand @state.editorState, e
//       @onChange newState if newState
//     return 'not-handled'

//   toggleInlineStyle: (inlineStyle) ->
//     @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

//   stripLinebreaks: (html) ->
//     html = html.replace(/<\/p><p>/g, '')
//     return html

//   onPaste: (text, html) ->
//     { editorState } = @state
//     unless html
//       html = '<div>' + text + '</div>'
//     html = standardizeSpacing html
//     html = stripGoogleStyles html
//     html = @stripLinebreaks(html) if @props.stripLinebreaks
//     html = html.replace(/<\/p><p>/g, '')
//     blocksFromHTML = @convertFromHTML html
//     convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
//       unstyled = stripCharacterStyles contentBlock, true
//       unless unstyled.getType() in @availableBlocks() or unstyled.getType() is 'LINK'
//         unstyled = unstyled.set 'type', 'unstyled'
//       return unstyled
//     blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.getBlocksAsArray()).blockMap
//     newState = Modifier.replaceWithFragment(
//       editorState.getCurrentContent()
//       editorState.getSelection()
//       blockMap
//     )
//     newState = EditorState.push(editorState, newState, 'insert-fragment')
//     @onChange newState
//     return true

//   promptForLink: (e) ->
//     { editorState } = @state
//     e.preventDefault() if e
//     selection = editorState.getSelection()
//     selectionTarget = {top: 0, left: 0}
//     url = ''
//     if !selection.isCollapsed()
//       editorPosition = ReactDOM.findDOMNode(@refs.editor).getBoundingClientRect()
//       selectionTarget = stickyControlsBox(editorPosition, 25, 200)
//       contentState = editorState.getCurrentContent()
//       startKey = selection.getStartKey()
//       startOffset = selection.getStartOffset()
//       blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
//       linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
//       if linkKey
//         linkInstance = contentState.getEntity(linkKey)
//         url = linkInstance.getData().url
//     @setState
//       showUrlInput: true
//       showNav: false
//       urlValue: url
//       selectionTarget: selectionTarget

//   confirmLink: (url) ->
//     { editorState } = @state
//     contentState = editorState.getCurrentContent()
//     contentStateWithEntity = contentState.createEntity(
//       'LINK'
//       'MUTABLE'
//       {url: url}
//     )
//     entityKey = contentStateWithEntity.getLastCreatedEntityKey()
//     newEditorState = EditorState.set editorState, { currentContent: contentStateWithEntity }
//     @setState({
//       showUrlInput: false
//       showNav: false
//       urlValue: ''
//       selectionTarget: null
//     })
//     @onChange RichUtils.toggleLink(
//       newEditorState
//       newEditorState.getSelection()
//       entityKey
//     )

//   removeLink: () ->
//     { editorState } = @state
//     selection = editorState.getSelection()
//     if !selection.isCollapsed()
//       @setState({
//         showUrlInput: false
//         urlValue: ''
//         editorState: RichUtils.toggleLink(editorState, selection, null)
//       })

//   printUrlInput: ->
//     if @state.showUrlInput
//       React.createElement(
//         TextInputUrl, {
//           onClickOff: () => @setState({showUrlInput: false})
//           selectionTarget: @state.selectionTarget
//           removeLink: @removeLink
//           confirmLink: @confirmLink
//           urlValue: @state.urlValue
//         }
//       )

//   checkSelection: ->
//     if !window.getSelection().isCollapsed
//       editorPosition = ReactDOM.findDOMNode(@refs.editor).getBoundingClientRect()
//       selectionTargetL = Config.inlineStyles(@props.type).length * 25
//       selectionTargetL = selectionTargetL + 25 if @hasLinks()
//       @setState showNav: true, selectionTarget: stickyControlsBox(editorPosition, -43, selectionTargetL)
//     else
//       @setState showNav: false

//   renderEditor: ->
//     div { className: 'rich-text--paragraph' },
//       if @state.showNav
//         React.createElement(
//           TextNav, {
//             styles: Config.inlineStyles(@props.type)
//             toggleStyle: @toggleInlineStyle
//             promptForLink: @promptForLink if @hasLinks()
//             position: @state.selectionTarget
//           }
//         )
//       div {
//         className: 'rich-text--paragraph__input'
//         onClick: @focus
//         onBlur: @onBlur
//         onMouseUp: @checkSelection
//         onKeyUp: @checkSelection
//       },
//         editor {
//           ref: 'editor'
//           placeholder: @props.placeholder
//           editorState: @state.editorState
//           spellCheck: true
//           onChange: @onChange
//           blockRenderMap: Config.blockRenderMap()
//           handleKeyCommand: @handleKeyCommand
//           keyBindingFn: keyBindingFnParagraph
//           handlePastedText: @onPaste
//         }
//       @printUrlInput()

//   render: ->
//     if @props.type is 'caption'
//       @renderEditor()
//     else
//       Text {
//         layout: @props.layout || 'classic'
//         postscript: @props.type is 'postscript'
//       },
//         @renderEditor()
