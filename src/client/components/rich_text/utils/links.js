import React from 'react'
import { EditorState, RichUtils } from 'draft-js'

export const confirmLink = (url, editorState) => {
  const contentState = editorState.getCurrentContent()
  const currentContent = contentState.createEntity(
    'LINK',
    'MUTABLE',
    { url }
  )
  const stateWithEntity = EditorState.set(
    editorState,
    { currentContent }
  )
  const entityKey = currentContent.getLastCreatedEntityKey()

  return RichUtils.toggleLink(
    stateWithEntity,
    stateWithEntity.getSelection(),
    entityKey
  )
}

export const removeLink = editorState => {
  const selection = editorState.getSelection()
  const hasTextSelection = !selection.isCollapsed()

  if (hasTextSelection) {
    return RichUtils.toggleLink(editorState, selection, null)
  }
}

export const linkDataFromSelection = editorState => {
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const startKey = selection.getStartKey()
  const startOffset = selection.getStartOffset()
  const blockWithLink = contentState.getBlockForKey(startKey)
  const linkKey = blockWithLink.getEntityAt(startOffset)

  if (linkKey) {
    const entity = contentState.getEntity(linkKey)
    return entity.getData()
  }
}
