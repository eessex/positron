import { Text } from '@artsy/reaction/dist/Components/Publishing/Sections/Text'
import { RichText } from 'client/components/draft/rich_text/rich_text'
import React from 'react'

// allowedBlocks?: any
// allowedStyles?: AllowedStyles
// html?: string
// hasLinks: boolean
// hasFollowButton: boolean
// onChange: (html: string) => void
// placeholder?: string
// isDark?: boolean

export const SectionText = (props: any) => {
  const { article, section, isInternalChannel } = props
  const isDark = ['standard', 'video'].includes(article.layout)

  return (
    // maybe hide tooltips?
    <Text layout={article.layout}>
      <RichText
        allowedBlocks={getBlockMap(article.layout, isInternalChannel)}
        hasLinks
        hasFollowButton={isInternalChannel}
        html={section.body || ''}
        isDark={isDark}
        onChange={args => args}
      />
    </Text>
  )
}

export const getBlockMap = (layout, isInternalChannel) => {
  switch (layout) {
    case 'feature': {
      return ['h1', 'h2', 'h3', 'blockquote', 'ol', 'ul', 'p']
    }
    case 'classic': {
      if (isInternalChannel) {
        return ['h2', 'h3', 'blockquote', 'ol', 'ul', 'p']
      } else {
        return ['h2', 'h3', 'ol', 'ul', 'p']
      }
    }
    default:
      return null
  }
}
