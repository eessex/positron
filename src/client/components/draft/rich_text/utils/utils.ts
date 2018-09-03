import {
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
} from 'draft-js'
import Immutable from 'immutable'
import { map } from 'lodash'
import React from 'react'
import { getSelectionDetails } from '../../../rich_text/utils/text_selection'
import { AllowedStyles, StyleMap } from './typings'

/**
 * Helpers for draft-js Paragraph component setup
 */

/**
 * blockRenderMap determines how HTML blocks are rendered in
 * draft's Editor component. 'unstyled' is equivalent to <p>.
 */
export const blockRenderMap = Immutable.Map({
  'header-two': {
    element: 'h2',
  },
  'header-three': {
    element: 'h3',
  },
  blockquote: {
    element: 'blockquote',
  },
  'unordered-list-item': {
    element: 'li',
  },
  'ordered-list-item': {
    element: 'li',
  },
  unstyled: {
    element: 'div',
  },
})

/**
 * Default allowedStyles for Paragraph component
 */
export const richTextStyleMap: StyleMap = [
  { label: 'B', name: 'BOLD' },
  { label: 'I', name: 'ITALIC' },
  { label: 'U', name: 'UNDERLINE' },
  { label: 'S', name: 'STRIKETHROUGH' },
]

/**
 * Returns styleMap from nodeNames
 * Used to attach node-names to props.allowedStyles
 */
export const styleMapFromNodes = (
  allowedStyles: AllowedStyles = ['B', 'I', 'U', 'S']
) => {
  const styleMap: StyleMap = []

  allowedStyles.map(style => {
    switch (style.toUpperCase()) {
      case 'B':
      case 'BOLD': {
        styleMap.push({ label: 'B', name: 'BOLD' })
        break
      }
      case 'I':
      case 'ITALIC': {
        styleMap.push({ label: 'I', name: 'ITALIC' })
        break
      }
      case 'U':
      case 'UNDERLINE': {
        styleMap.push({ label: 'U', name: 'UNDERLINE' })
        break
      }
      case 'S':
      case 'STRIKETHROUGH': {
        styleMap.push({ label: 'S', name: 'STRIKETHROUGH' })
        break
      }
    }
  })
  return styleMap
}

/**
 * Returns the names of allowed styles
 * Used for key commands, TextNav, and draft-convert
 */
export const styleNamesFromMap = (styles: StyleMap = richTextStyleMap) => {
  return map(styles, 'name')
}

/**
 * Returns the nodeNames for allowed styles
 * Used for draft-convert
 */
export const styleNodesFromMap = (styles: StyleMap = richTextStyleMap) => {
  return map(styles, 'label')
}

/**
 * Extend keybindings
 */
export const keyBindingFn = (e: React.KeyboardEvent<{}>) => {
  // Custom key commands for full editor
  if (KeyBindingUtil.hasCommandModifier(e)) {
    switch (e.keyCode) {
      case 49:
        // command + 1
        return 'header-one'
      case 50:
        // command + 2
        return 'header-two'
      case 51:
        // command + 3
        return 'header-three'
      case 191:
        // command + /
        return 'custom-clear'
      case 55:
        // command + 7
        return 'ordered-list-item'
      case 56:
        // command + 8
        return 'unordered-list-item'
      case 75:
        // command + k
        return 'link-prompt'
      case 219:
        // command + [
        return 'blockquote'
      case 88:
        // command + shift + X
        if (e.shiftKey) {
          return 'strikethrough'
        }
      default:
        return getDefaultKeyBinding(e)
    }
  }
  return getDefaultKeyBinding(e)
}

/**
 * Prevents consecutive empty paragraphs
 */
export const handleReturn = (
  e: React.KeyboardEvent<{}>,
  editorState: EditorState
) => {
  const { anchorOffset, isFirstBlock } = getSelectionDetails(editorState)

  if (isFirstBlock || anchorOffset) {
    // If first block, no chance of empty block before
    // If anchor offset, the block is not empty
    return 'not-handled'
  } else {
    // Return handled to avoid creating empty blocks
    e.preventDefault()
    return 'handled'
  }
}

/**
 * Merges a state created from pasted text into editorState
 */
export const insertPastedState = (
  pastedState: EditorState,
  editorState: EditorState
) => {
  const blockMap = pastedState.getCurrentContent().getBlockMap()

  // Merge blockMap from pasted text into existing content
  const modifiedContent = Modifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    blockMap
  )
  // Create a new editorState from merged content
  return EditorState.push(editorState, modifiedContent, 'insert-fragment')
}
