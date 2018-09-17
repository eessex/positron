import {
  EditorState,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
} from 'draft-js'
import Immutable from 'immutable'
import { map, uniq } from 'lodash'
import React from 'react'
import { getSelectionDetails } from '../../../rich_text/utils/text_selection'
import { AllowedBlocks, AllowedStyles, StyleMap } from './typings'

/**
 * Helpers for draft-js Paragraph component setup
 */

/**
 * Default allowedBlocks for RichText component
 */
export const richTextBlockRenderMap = Immutable.Map({
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
 * Returns blockMap from element names
 * Used to generate blockMap from props.allowedBlocks
 */
export const blockMapFromNodes = (
  allowedBlocks: AllowedBlocks = ['h2', 'h3', 'blockquote', 'ul', 'ol', 'p']
) => {
  const blockMap: any = []

  allowedBlocks.map(block => {
    switch (block) {
      case 'h1': {
        blockMap.push({ name: 'header-one', element: 'h1' })
        break
      }
      case 'h2': {
        blockMap.push({ name: 'header-two', element: 'h2' })
        break
      }
      case 'h3': {
        blockMap.push({ name: 'header-three', element: 'h3' })
        break
      }
      case 'blockquote': {
        blockMap.push({ name: 'blockquote', element: 'blockquote' })
        break
      }
      case 'ul': {
        blockMap.push({ name: 'unordered-list-item', element: 'li' })
        break
      }
      case 'ol': {
        blockMap.push({ name: 'ordered-list-item', element: 'li' })
        break
      }
      case 'p': {
        blockMap.push({ name: 'unstyled', element: 'div' })
        break
      }
    }
  })

  const blocksToImmutableMap = blockMap.reduce((obj, block) => {
    return obj.set(block.name, {
      element: block.element,
    })
  }, Immutable.Map())

  return blocksToImmutableMap
}

/**
 * Returns the names of allowed blocks
 * Used for key commands, TextNav, and draft-convert
 */
export const blockNamesFromMap = (blocks: any = richTextBlockRenderMap) => {
  return Array.from(blocks.keys())
}

/**
 * Returns the element type for allowed blocks
 * Used for draft-convert
 */
export const blockElementsFromMap = (blocks: any = richTextBlockRenderMap) => {
  return uniq(map(Array.from(blocks.values()), 'element'))
}

/**
 * Default allowedStyles for RichText component
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