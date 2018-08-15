import { EditorState, RichUtils } from 'draft-js'

export const confirmLink = (url, editorState) => {
  // Create a link entity from url
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
  // Insert entity at text selection
  return RichUtils.toggleLink(
    stateWithEntity,
    stateWithEntity.getSelection(),
    entityKey
  )
}

export const removeLink = editorState => {
  // Remove link entity from selected text
  const selection = editorState.getSelection()
  const hasTextSelection = !selection.isCollapsed()

  if (hasTextSelection) {
    return RichUtils.toggleLink(editorState, selection, null)
  }
}

export const linkDataFromSelection = editorState => {
  // Get data from an existing link from text selection
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const startKey = selection.getStartKey()
  const startOffset = selection.getStartOffset()
  const blockWithLink = contentState.getBlockForKey(startKey)
  const linkKey = blockWithLink.getEntityAt(startOffset)
  // If selected text has a link, return data
  if (linkKey) {
    const entity = contentState.getEntity(linkKey)
    return entity.getData()
  }
}
