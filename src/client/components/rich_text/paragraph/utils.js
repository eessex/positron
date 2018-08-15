import { map } from 'lodash'
import {
  getDefaultKeyBinding,
  EditorState,
  KeyBindingUtil,
  Modifier
} from 'draft-js'
import { getSelectionDetails } from '../utils/text_selection'

const paragraphStyleMap = [
  // Default allowedStyles
  {label: 'B', name: 'BOLD'},
  {label: 'I', name: 'ITALIC'}
]

export const styleMapFromNames = (allowedStyles = ['B', 'I']) => {
  /**
   * Returns styleMap from nodeNames
   * Used to attach node-names to props.allowedStyles
   */
  let styleMap = []

  allowedStyles.map(style => {
    switch (style.toUpperCase()) {
      case 'B':
      case 'BOLD': {
        styleMap.push(
          {label: 'B', name: 'BOLD'}
        )
        break
      }
      case 'I':
      case 'ITALIC': {
        styleMap.push(
          {label: 'I', name: 'ITALIC'}
        )
        break
      }
    }
  })
  return styleMap
}

export const styleNamesFromMap = (styles = paragraphStyleMap) => {
  /**
   * Returns the names of allowed styles
   * Used for key commands, TextNav, and draft-convert
   */
  return map(styles, 'name')
}

export const styleNodesFromMap = (styles = paragraphStyleMap) => {
  /**
   * Returns the nodeNames for allowed styles
   * Used for draft-convert
   */
  return map(styles, 'label')
}

export const keyBindingFn = e => {
  // Extend keybindings to open link input
  if (KeyBindingUtil.hasCommandModifier(e) && e.keyCode === 75) {
    // command + k
    return 'link-prompt'
  } else {
    return getDefaultKeyBinding(e)
  }
}

export const insertPastedState = (pastedState, editorState) => {
  // Merges a state created from pasted text with editorState
  const blockMap = pastedState.getCurrentContent().blockMap
  // Merge new blockmap into existing content
  const modifiedContent = Modifier.replaceWithFragment(
    editorState.getCurrentContent(),
    editorState.getSelection(),
    blockMap
  )
  // Create a new editorState from merged content
  const newState = EditorState.push(
    editorState, modifiedContent, 'insert-fragment'
  )
  return newState
}

export const handleReturn = (e, editorState) => {
  // Prevents consecutive empty paragraphs
  const {
    anchorOffset,
    isFirstBlock
  } = getSelectionDetails(editorState)

  // If first block, no chance of empty block before
  // If anchor offset, block is not empty
  if (isFirstBlock || anchorOffset) {
    return 'not-handled'
  } else {
    // Return handled to avoid creating empty blocks
    e.preventDefault()
    return 'handled'
  }
}
