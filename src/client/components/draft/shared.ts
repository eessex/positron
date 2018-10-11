import { EditorState, Modifier } from "draft-js"
import { map, uniq } from "lodash"
import { getSelectionDetails } from "../rich_text/utils/text_selection"
import { StyleMap } from "./typings"

/**
 * Returns the names of allowed styles
 * Used for key commands, TextNav, and draft-convert
 */
export const styleNamesFromMap = (styles: StyleMap) => {
  return map(styles, "name")
}

/**
 * Returns the nodeNames for allowed styles
 * Used for draft-convert
 */
export const styleNodesFromMap = (styles: StyleMap) => {
  return map(styles, "element")
}

/**
 * Returns the names of allowed blocks
 * Used for key commands, TextNav, and draft-convert
 * TODO: Type blockRenderMap
 */
export const blockNamesFromMap = (blocks: any) => {
  return Array.from(blocks.keys())
}

/**
 * Returns the element type for allowed blocks
 * Used for draft-convert
 * TODO: Type blockRenderMap
 */
export const blockElementsFromMap = (blocks: any) => {
  return uniq(map(Array.from(blocks.values()), "element"))
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
    return "not-handled"
  } else {
    // Return handled to avoid creating empty blocks
    e.preventDefault()
    return "handled"
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
  return EditorState.push(editorState, modifiedContent, "insert-fragment")
}
