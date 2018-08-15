import React from 'react'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import { styleNamesFromMap, styleNodesFromMap } from './utils'
import { stripGoogleStyles, stripParagraphLinebreaks } from '../utils/text_stripping'

export const draftDefaultStyles = [
  'BOLD',
  'CODE',
  'ITALIC',
  'STRIKETHROUGH',
  'UNDERLINE'
]

/**
 * Convert HTML to Draft Content State
 */

export const convertHtmlToDraft = (html, linked, allowedStyles) => {
  let cleanedHtml = stripGoogleStyles(html)

  return convertFromHTML({
    htmlToBlock,
    htmlToEntity: linked ? htmlToEntity : undefined,
    htmlToStyle: (nodeName, node, currentStyle) => {
      return htmlToStyle(nodeName, node, currentStyle, allowedStyles)
    }
  })(cleanedHtml)
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

/**
 * Convert Draft Content State to HTML
 */

export const convertDraftToHtml = (currentContent, allowedStyles, stripLinebreaks) => {
  const styles = styleNamesFromMap(allowedStyles)

  const html = convertToHTML({
    entityToHTML,
    styleToHTML: style => styleToHTML(style, styles),
    blockToHTML
  })(currentContent)

  if (stripLinebreaks) {
    return stripParagraphLinebreaks(html)
  } else {
    return html
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

export const entityToHTML = (entity, originalText) => {
  if (entity.type === 'LINK') {
    const innerText = originalText
    return <a href={entity.data.url}>{innerText}</a>
  }
  return originalText
}

export const blockToHTML = block => {
  // TODO: Fix type switching from draft-convert to avoid weird if statement
  if (block.type === 'ordered-list-item') {
    return {
      start: '<p>',
      end: '</p>',
      nestStart: '',
      nestEnd: ''
    }
  }
  if (block.type === 'unordered-list-item') {
    return {
      start: '<p>',
      end: '</p>',
      nestStart: '',
      nestEnd: ''
    }
  } else {
    return {
      start: '<p>',
      end: '</p>'
    }
  }
}
