import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import {
  newSection,
  onChangeSection,
  onInsertBlockquote,
  onSplitTextSection,
  removeSection,
  setSection,
} from "client/actions/edit/sectionActions"
import { RichText } from "client/components/draft/rich_text/rich_text"
import { convertDraftToHtml } from "client/components/draft/rich_text/utils/convert"
import {
  AllowedStyles,
  BlockElement,
} from "client/components/draft/rich_text/utils/typings"
import { richTextBlockNodes } from "client/components/draft/rich_text/utils/utils"
import {
  blockMapFromNodes,
  styleMapFromNodes,
} from "client/components/draft/rich_text/utils/utils"
import { getSelectionDetails } from "client/components/rich_text/utils/text_selection"
import { ContentState, EditorState } from "draft-js"
import { cloneDeep } from "lodash"
import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import _s from "underscore.string"

interface Props {
  article: any
  editing: boolean
  index: number
  isInternalChannel: boolean
  newSectionAction: (type: string, index: number, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  onInsertBlockquoteAction: (
    blockquote: string,
    beforeHtml: string,
    afterHtml: string
  ) => void
  onSplitTextSectionAction: (
    sectionIndex: number,
    originalBody: string,
    newBody: string
  ) => void
  section: any
  setSectionAction: (sectionIndex: number | null) => void
}

export class SectionText extends React.Component<Props> {
  onHandleReturn = (editorState: EditorState, resetEditorState: () => void) => {
    const {
      article,
      index,
      isInternalChannel,
      onSplitTextSectionAction,
    } = this.props
    const allowedBlocks = getAllowedBlocks(article.layout, isInternalChannel)
    const allowedStyles: AllowedStyles = ["B", "I", "S"]
    const { anchorKey } = getSelectionDetails(editorState)

    const newBlocks = divideEditorState(
      editorState,
      anchorKey,
      blockMapFromNodes(allowedBlocks),
      styleMapFromNodes(allowedStyles),
      isInternalChannel
    )
    if (newBlocks) {
      onSplitTextSectionAction(index, newBlocks.beforeHtml, newBlocks.afterHtml)
      resetEditorState()
      // TODO: Select next section
    }
  }

  onHandleBlockQuote = (html: string, resetEditorState: () => void) => {
    const { onInsertBlockquoteAction } = this.props
    const newBlocks = extractBlockQuote(html)
    if (newBlocks) {
      const { blockquote, beforeHtml, afterHtml } = newBlocks

      onInsertBlockquoteAction(blockquote, beforeHtml, afterHtml)
      resetEditorState()
      // setSectionAction(null) // TODO: Select next section
    }
  }

  render() {
    const {
      article,
      editing,
      isInternalChannel,
      onChangeSectionAction,
      section,
    } = this.props
    const isDark = ["series", "video"].includes(article.layout)
    const allowedBlocks = getAllowedBlocks(article.layout, isInternalChannel)
    const allowedStyles: AllowedStyles = ["B", "I", "S"]

    return (
      // maybe hide tooltips?
      <SectionTextContainer isEditing={editing}>
        <Text layout={article.layout}>
          <RichText
            allowedBlocks={allowedBlocks}
            allowedStyles={allowedStyles}
            hasLinks
            hasFollowButton={isInternalChannel}
            html={section.body || ""}
            isDark={isDark}
            onHandleBlockQuote={this.onHandleBlockQuote}
            onHandleReturn={this.onHandleReturn}
            onChange={html => onChangeSectionAction("body", html)}
          />
        </Text>
      </SectionTextContainer>
    )
  }
}

export const getAllowedBlocks = (
  layout: string,
  isInternalChannel: boolean
) => {
  let blocks: BlockElement[] = richTextBlockNodes

  switch (layout) {
    case "feature": {
      blocks = ["h1", "h2", "h3", "blockquote", "ol", "ul", "p"]
    }
    case "standard": {
      blocks = ["h2", "h3", "blockquote", "ol", "ul", "p"]
    }
    case "news": {
      blocks = ["h3", "blockquote", "ol", "ul", "p"]
    }
    case "classic": {
      if (isInternalChannel) {
        blocks = ["h2", "h3", "blockquote", "ol", "ul", "p"]
      }
    }
  }
  return blocks
}

export const extractBlockQuote = (html: string) => {
  let blockquote = html
  const beforeHtml = _s(html).strLeft("<blockquote>")._wrapped
  const afterHtml = _s(html).strRight("</blockquote>")._wrapped

  if (beforeHtml) {
    // add text before blockquote to new text section
    blockquote = html.replace(beforeHtml, "")
  }

  if (afterHtml) {
    // add text after blockquote to new text section
    blockquote = html.replace(afterHtml, "")
  }

  return {
    blockquote,
    beforeHtml,
    afterHtml,
  }
}

export const divideEditorState = (
  editorState,
  anchorKey,
  allowedBlocks,
  allowedStyles,
  hasFollowButton
) => {
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
      allowedBlocks,
      allowedStyles,
      hasFollowButton
    )
    const afterHtml = convertDraftToHtml(
      afterContent,
      allowedBlocks,
      allowedStyles,
      hasFollowButton
    )

    return {
      beforeHtml,
      afterHtml,
    }
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  isInternalChannel: state.app.channel.type !== "partner",
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
  onInsertBlockquoteAction: onInsertBlockquote,
  onSplitTextSectionAction: onSplitTextSection,
  newSectionAction: newSection,
  removeSectionAction: removeSection,
  setSectionAction: setSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionText)

const SectionTextContainer = styled.div.attrs<{ isEditing?: boolean }>({})`
  position: relative;
  z-index: ${props => (props.isEditing ? 2 : -1)};

  ol li, ul li, li {
    list-style: none;
    .public-DraftStyleDefault-ltr {
      display: list-item;
      margin-left: 20px;
      padding-left: 10px;
    }
  }
  ol li .public-DraftStyleDefault-ltr,
  li.public-DraftStyleDefault-orderedListItem .public-DraftStyleDefault-ltr {
    list-style: decimal;
  }
  ul li .public-DraftStyleDefault-ltr,
  li.public-DraftStyleDefault-unorderedListItem .public-DraftStyleDefault-ltr {
    list-style disc
  }
`
