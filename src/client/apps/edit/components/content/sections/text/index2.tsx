import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import {
  onChangeSection,
  removeSection,
  setSection,
} from "client/actions/edit/sectionActions"
import {
  divideEditorState,
  getAllowedBlocks,
  maybeMergeTextSections,
  onHandleBlockQuote,
  onSplitTextSection,
} from "client/actions/edit/textSectionActions"
import {
  Button,
  TextNavContainer,
} from "client/components/draft/components/text_nav"
import { RichText } from "client/components/draft/rich_text/rich_text"
import { richTextStyleElements } from "client/components/draft/rich_text/utils/utils"
import { BlockElement } from "client/components/draft/typings"
import { EditorState } from "draft-js"
import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import _s from "underscore.string"

interface Props {
  article: any
  editing: boolean
  index: number
  isInternalChannel: boolean
  divideEditorStateAction: (
    editorState: EditorState
  ) => {
    beforeHtml: string
    afterHtml: string
  } | void
  getAllowedBlocksAction: () => BlockElement[]
  onChangeSectionAction: (key: string, val: any) => void
  onHandleBlockQuoteAction: (html: string) => void
  maybeMergeTextSectionsAction: () => void
  onSplitTextSectionAction: (originalBody: string, newBody: string) => void
  section: any
  sectionIndex: number | null
  setSectionAction: (sectionIndex: number | null) => void
}

export class SectionText2 extends React.Component<Props> {
  onHandleReturn = (
    editorState: EditorState,
    _resetEditorState: () => void
  ) => {
    // TODO: maybe move to redux text actions
    const { divideEditorStateAction, onSplitTextSectionAction } = this.props
    const newBlocks = divideEditorStateAction(editorState)

    if (newBlocks) {
      onSplitTextSectionAction(newBlocks.beforeHtml, newBlocks.afterHtml)
    }
  }

  /**
   * Change to next section when tabbing, reset editor state
   */
  onHandleTab = (e: any, resetEditorState: () => void) => {
    const { index, setSectionAction } = this.props

    if (e.shiftKey) {
      setSectionAction(index - 1)
    } else {
      setSectionAction(index + 1)
    }
    resetEditorState()
  }

  /**
   * Maybe merge two text sections into one
   */
  onHandleBackspace = () => {
    const { index, maybeMergeTextSectionsAction } = this.props

    if (index !== 0) {
      maybeMergeTextSectionsAction()
    }
  }

  render() {
    const {
      article: { layout },
      editing,
      getAllowedBlocksAction,
      isInternalChannel,
      onChangeSectionAction,
      onHandleBlockQuoteAction,
      section,
      sectionIndex,
    } = this.props
    const isDark = ["series", "video"].includes(layout)
    const allowedBlocks = getAllowedBlocksAction()

    return (
      <SectionTextContainer isEditing={editing} layout={layout}>
        <Text layout={layout}>
          <RichText
            allowedBlocks={allowedBlocks}
            allowedStyles={richTextStyleElements}
            editIndex={sectionIndex}
            isReadonly={!editing}
            hasFollowButton={isInternalChannel}
            hasLinks
            html={section.body || ""}
            isDark={isDark}
            onHandleBackspace={this.onHandleBackspace}
            onHandleBlockQuote={onHandleBlockQuoteAction}
            onHandleReturn={this.onHandleReturn}
            onHandleTab={this.onHandleTab}
            onChange={html => onChangeSectionAction("body", html)}
          />
        </Text>
      </SectionTextContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  isInternalChannel: !state.app.isPartnerChannel,
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  divideEditorStateAction: divideEditorState,
  getAllowedBlocksAction: getAllowedBlocks,
  maybeMergeTextSectionsAction: maybeMergeTextSections,
  onChangeSectionAction: onChangeSection,
  onHandleBlockQuoteAction: onHandleBlockQuote,
  onSplitTextSectionAction: onSplitTextSection,
  removeSectionAction: removeSection,
  setSectionAction: setSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionText2)

const SectionTextContainer = styled.div<{
  isEditing?: boolean
  layout: string
}>`
  position: relative;
  z-index: ${props => (props.isEditing ? 10 : -1)};

  ol li,
  ul li,
  li {
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
    list-style: disc;
  }

  ${TextNavContainer} {
    ${({ layout }) =>
      layout === "standard" &&
      `
      max-width: 250px;
    `};

    ${Button} {
      ${({ layout }) =>
        layout === "standard" &&
        `
        &:nth-child(7) {
          display: none;
        }
      `};
    }
  }
`
