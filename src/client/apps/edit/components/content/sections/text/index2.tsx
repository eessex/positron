import { Text } from '@artsy/reaction/dist/Components/Publishing/Sections/Text'
import {
  newSection,
  onChangeSection,
  removeSection,
} from 'client/actions/edit/sectionActions'
import { RichText } from 'client/components/draft/rich_text/rich_text'
import { convertDraftToHtml } from 'client/components/draft/rich_text/utils/convert'
import { AllowedStyles } from 'client/components/draft/rich_text/utils/typings'
import { richTextBlockNodes } from 'client/components/draft/rich_text/utils/utils'
import { styleMapFromNodes } from 'client/components/draft/rich_text/utils/utils'
import { ContentState, EditorState } from 'draft-js'
import { cloneDeep } from 'lodash'
import React from 'react'
import { connect } from 'react-redux'

export const SectionText = (props: any) => {
  const {
    article,
    index,
    isInternalChannel,
    newSectionAction,
    onChangeSectionAction,
    section,
  } = props
  const isDark = ['series', 'video'].includes(article.layout)
  const allowedBlocks = getBlockMap(article.layout, isInternalChannel)
  const allowedStyles: AllowedStyles = ['B', 'I', 'S']

  return (
    // maybe hide tooltips?
    <Text layout={article.layout}>
      <RichText
        allowedBlocks={getBlockMap(article.layout, isInternalChannel)}
        allowedStyles={allowedStyles}
        hasLinks
        hasFollowButton={isInternalChannel}
        html={section.body || ''}
        isDark={isDark}
        handleBlockquote={args => args}
        handleReturn={(editorState: EditorState, anchorKey: string) => {
          const newBlocks = divideEditorState(
            editorState,
            anchorKey,
            allowedBlocks,
            styleMapFromNodes(allowedStyles),
            isInternalChannel
          )
          if (newBlocks) {
            onChangeSectionAction('body', newBlocks.beforeHtml)
            newSectionAction('text', index + 1, { body: newBlocks.afterHtml })
          }
        }}
        onChange={html => onChangeSectionAction('body', html)}
      />
    </Text>
  )
}

export const getBlockMap = (layout, isInternalChannel) => {
  switch (layout) {
    case 'feature': {
      return ['h1', 'h2', 'h3', 'blockquote', 'ol', 'ul', 'p']
    }
    case 'standard': {
      return ['h2', 'h3', 'blockquote', 'ol', 'ul', 'p']
    }
    case 'news': {
      return ['h3', 'blockquote', 'ol', 'ul', 'p']
    }
    case 'classic': {
      if (isInternalChannel) {
        return ['h2', 'h3', 'blockquote', 'ol', 'ul', 'p']
      } else {
        return richTextBlockNodes
      }
    }
    default:
      return richTextBlockNodes
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
  isInternalChannel: state.app.channel.type !== 'partner',
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
  newSectionAction: newSection,
  removeSectionAction: removeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionText)
