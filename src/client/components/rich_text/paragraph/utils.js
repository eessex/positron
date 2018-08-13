import { map } from 'lodash'
import {
  getDefaultKeyBinding,
  EditorState,
  KeyBindingUtil,
  Modifier
} from 'draft-js'
import React from 'react'
import { getSelectionDetails } from '../utils/text_selection'

export const paragraphStyles = [
  {label: 'B', name: 'BOLD'},
  {label: 'I', name: 'ITALIC'}
]

export const draftDefaultStyles = [
  'BOLD',
  'CODE',
  'ITALIC',
  'STRIKETHROUGH',
  'UNDERLINE'
]

export const styleMapFromNames = (allowedStyles = ['B', 'I']) => {
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

export const styleNamesFromMap = (styles = paragraphStyles) => {
  return map(styles, 'name')
}

export const styleNodesFromMap = (styles = paragraphStyles) => {
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

export const htmlToBlock = (nodeName, node) => {
  if (['body', 'ul', 'ol', 'tr'].includes(nodeName)) {
    // Nested elements are empty, wrap their children instead
    return {}
  } else {
    // Return all elements as default block
    return {
      type: 'unstyled',
      element: 'div'
    }
  }
}

export const htmlToStyle = (nodeName, node, currentStyle, allowedStyles) => {
  const styleNodes = styleNodesFromMap(allowedStyles)
  const styleNames = styleNamesFromMap(allowedStyles)
  const isBlock = ['body', 'p', 'div'].includes(nodeName)
  const isAllowedNode = styleNodes.includes(nodeName.toUpperCase())

  if (isBlock || isAllowedNode) {
    return currentStyle
  } else {
    // Remove draft default styles unless explicitly allowed
    let style = currentStyle
    draftDefaultStyles.map(draftStyle => {
      const isAllowedStyle = styleNames.includes(draftStyle)
      if (!isAllowedStyle) {
        style = style.remove(draftStyle)
      }
    })
    return style
  }
}

export const styleToHTML = (style, allowedStyles) => {
  const isAllowed = allowedStyles.includes(style)

  switch (style) {
    case 'BOLD':
      return isAllowed ? <b /> : null
    case 'ITALIC':
      return isAllowed ? <i /> : null
    default:
      return null
  }
}

export const insertPastedState = (pastedState, editorState) => {
  const blockMap = pastedState.getCurrentContent().blockMap
  // Merge a new blockmap into existing content
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
  // Dont allow consecutive empty paragraphs
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

export const htmlToEntity = (nodeName, node, createEntity) => {
  if (nodeName === 'a') {
    const data = { url: node.href }
    return createEntity(
      'LINK',
      'MUTABLE',
      data
    )
  }
}

export const entityToHTML = (entity, originalText) => {
  if (entity.type === 'LINK') {
    const innerText = originalText
    return <a href={entity.data.url}>{innerText}</a>
  }
  return originalText
}
