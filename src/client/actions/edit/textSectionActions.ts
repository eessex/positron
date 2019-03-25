import {
  newSection,
  onChangeSection,
  removeSection,
  setSection,
} from "client/actions/edit//sectionActions"
import {
  debouncedSaveDispatch,
  onChangeArticle,
} from "client/actions/edit/articleActions"
import { convertDraftToHtml } from "client/components/draft/rich_text/utils/convert"
import {
  richTextBlockElements,
  richTextStyleElements,
} from "client/components/draft/rich_text/utils/utils"
import { blockMapFromNodes } from "client/components/draft/rich_text/utils/utils"
import { getSelectionDetails } from "client/components/draft/shared/selection"
import { styleMapFromNodes } from "client/components/draft/shared/shared"
import { BlockElement } from "client/components/draft/typings"
import { ContentState } from "draft-js"
import { EditorState } from "draft-js"
import { cloneDeep } from "lodash"
import { clean, stripTags } from "underscore.string"
import _s from "underscore.string"

/**
 * Actions related to changing data in an article text sections via the edit/content app
 */

/**
 *  Return block elements allowed in text editor based on article.layout
 */
export const getAllowedBlocks = () => {
  return (_dispatch, getState) => {
    const {
      edit: {
        article: { layout },
      },
    } = getState()
    const blocks: BlockElement[] = richTextBlockElements
    // TODO: Move to redux actions
    switch (layout) {
      case "feature": {
        return [
          "h1",
          "h2",
          "h3",
          "blockquote",
          "ol",
          "ul",
          "p",
        ] as BlockElement[]
      }
      case "standard": {
        return ["h2", "h3", "blockquote", "ol", "ul", "p"] as BlockElement[]
      }
      case "news": {
        return ["h3", "blockquote", "ol", "ul", "p"] as BlockElement[]
      }
      default: {
        return blocks
      }
    }
  }
}

/**
 * Accepts two strings of html, replaces the section currently
 * being edited with two text sections
 */
export const onSplitTextSection = (
  existingSectionBody: string,
  newSectionBody: string
) => {
  return (dispatch, getState) => {
    const {
      edit: { article, sectionIndex },
    } = getState()
    // update original section with updated content
    dispatch(onChangeSection("body", existingSectionBody))
    dispatch(newSection("text", sectionIndex + 1, { body: newSectionBody }))

    if (!article.published) {
      debouncedSaveDispatch(dispatch)
    }
  }
}

/**
 * Checks if section before currently edited section is of type text and
 * if so, merges content of sections together
 *
 * Also removes blockquotes to ensure that new section does not combine
 * disallowed block types (all blockquotes must exist in their own section
 * because they are rendered at a wider width than other text blocks)
 */
export const maybeMergeTextSections = () => {
  return (dispatch, getState) => {
    const {
      edit: {
        article: { sections },
        section,
        sectionIndex,
      },
    } = getState()
    if (sections.length && sectionIndex !== 0) {
      const sectionBefore = sections[sectionIndex - 1]
      const sectionBeforeIsText = sectionBefore && sectionBefore.type === "text"

      if (sectionBeforeIsText) {
        const newHtml = sectionBefore.body + section.body
        const strippedHtml = newHtml
          .replace("<blockquote>", "<p>")
          .replace("</blockquote>", "</p>")
        dispatch(onMergeTextSections(strippedHtml))
      }
    }
  }
}

/**
 * Replaces current section html with newHtml arg and deletes previous section
 * Called only from inside #maybeMergeTextSections to ensure that action is allowed
 */
export const onMergeTextSections = (newHtml: string) => {
  return (dispatch, getState) => {
    const {
      edit: { sectionIndex },
    } = getState()
    dispatch(onChangeSection("body", newHtml))
    dispatch(removeSection(sectionIndex - 1))
  }
}

/**
 * To ensure that all blockquotes are confined to their own section,
 * insert new sections before or after changed text block when necessary
 *
 * sets currently editing section to null to ensure all draftjs states are refreshed
 */
export const onInsertBlockquote = (
  blockquoteHtml: string,
  beforeHtml: string,
  afterHtml: string
) => {
  return (dispatch, getState) => {
    const {
      edit: { article, sectionIndex },
    } = getState()

    dispatch(onChangeSection("body", blockquoteHtml))
    if (afterHtml) {
      // insert a section after if html is provided
      dispatch(newSection("text", sectionIndex + 1, { body: afterHtml }))
    }
    if (beforeHtml) {
      // insert a section before if html is provided
      dispatch(newSection("text", sectionIndex, { body: beforeHtml }))
    }
    if ((beforeHtml || afterHtml) && !article.published) {
      debouncedSaveDispatch(dispatch)
    }
    dispatch(setSection(null))
  }
}

/**
 * Extract a blockquote from html and return any html blocks
 * occurring before or after the blockquote
 */
export const extractBlockQuote = (html: string) => {
  return (_dispatch, _getState) => {
    let blockquote = html
    const beforeHtml = _s(html).strLeft("<blockquote>")._wrapped
    const afterHtml = _s(html).strRight("</blockquote>")._wrapped

    if (beforeHtml) {
      // add text before blockquote to new text section
      blockquote = blockquote.replace(beforeHtml, "")
    }
    if (afterHtml) {
      // add text after blockquote to new text section
      blockquote = blockquote.replace(afterHtml, "")
    }
    const newBlocks = {
      blockquote,
      beforeHtml,
      afterHtml,
    }
    return newBlocks
  }
}

/**
 * Extract blockquote to its own section to accomodate wide layout
 */
export const onHandleBlockQuote = (html: string) => {
  return (dispatch, _getState) => {
    const newBlocks = dispatch(extractBlockQuote(html))

    if (newBlocks) {
      const { blockquote, beforeHtml, afterHtml } = newBlocks
      dispatch(onInsertBlockquote(blockquote, beforeHtml, afterHtml))
    }
  }
}

/**
 * Check section.body to ensure that html will render text. If html is empty or
 * blocktype is h1 (an allowed placeholder), will strip spaces from h1
 */
export const maybeRemoveEmptyText = (sectionIndex: number) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const newArticle = cloneDeep(article)
    const activeSection = newArticle.sections[sectionIndex]
    const isText = activeSection.type === "text"

    if (!isText) {
      // No action necessary if section is not text
      return
    } else {
      const isEmptyHtml = !clean(stripTags(activeSection.body)).length
      const isEmptyH1 = isEmptyHtml && activeSection.body.includes("<h1>")

      if (!isEmptyHtml) {
        // No action necessary if text is present
        return
      } else if (isEmptyH1) {
        // Preserve empty H1 as section divider
        newArticle.sections[sectionIndex].body = "<h1></h1>"
        dispatch(onChangeArticle("sections", newArticle.sections))
      } else {
        // Remove text sections with empty body
        dispatch(removeSection(sectionIndex))
      }
    }
  }
}

/**
 * Divide an editorState into two editStates at anchorKey
 */
export const divideEditorState = (editorState: EditorState) => {
  return (dispatch, getState) => {
    const {
      app: { isInternalChannel },
    } = getState()

    const allowedBlocks = dispatch(getAllowedBlocks())
    const allowedStyles = richTextStyleElements
    const { anchorKey } = getSelectionDetails(editorState)
    const blockArray = editorState.getCurrentContent().getBlocksAsArray()
    let beforeBlocks
    let afterBlocks

    blockArray.map((block, index) => {
      if (block.getKey() === anchorKey) {
        // split blocks from end of selected block
        beforeBlocks = blockArray.splice(0, index)
        afterBlocks = cloneDeep(blockArray)
      }
    })

    if (beforeBlocks) {
      const beforeContent = ContentState.createFromBlockArray(beforeBlocks)
      const afterContent = ContentState.createFromBlockArray(afterBlocks)

      const beforeHtml = convertDraftToHtml(
        beforeContent,
        blockMapFromNodes(allowedBlocks),
        styleMapFromNodes(allowedStyles),
        isInternalChannel
      )
      const afterHtml = convertDraftToHtml(
        afterContent,
        blockMapFromNodes(allowedBlocks),
        styleMapFromNodes(allowedStyles),
        isInternalChannel
      )

      return {
        beforeHtml,
        afterHtml,
      }
    }
  }
}
