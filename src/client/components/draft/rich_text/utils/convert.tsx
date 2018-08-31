import node from '@artsy/reaction/dist/__generated__/ArtistToolTip_artist.graphql'
import { convertFromHTML, convertToHTML } from 'draft-convert'
import {
  ContentState,
  DraftEntityMutability,
  RawDraftContentBlock,
  RawDraftEntity,
} from 'draft-js'
import React from 'react'
import { stripGoogleStyles } from '../../../rich_text/utils/text_stripping'
import { StyleMap, StyleMapNames, StyleName } from './typings'
import { styleNamesFromMap, styleNodesFromMap } from './utils'

/**
 * Helpers for draft-js Paragraph component data conversion
 */

export const draftDefaultStyles = [
  'BOLD',
  'CODE',
  'ITALIC',
  'STRIKETHROUGH',
  'UNDERLINE',
]

/**
 * Convert HTML to Draft ContentState
 */
export const convertHtmlToDraft = (
  html: string,
  hasLinks: boolean,
  allowedStyles: StyleMap
) => {
  const cleanedHtml = stripGoogleStyles(html)

  return convertFromHTML({
    htmlToBlock,
    htmlToEntity: hasLinks ? htmlToEntity : undefined,
    // TODO: type currentStyle OrderedSet
    htmlToStyle: (nodeName: string, _: HTMLElement, currentStyle: any) => {
      return htmlToStyle(nodeName, currentStyle, allowedStyles)
    },
  })(cleanedHtml)
}

/**
 * Convert Draft ContentState to HTML
 */
export const convertDraftToHtml = (
  currentContent: ContentState,
  allowedStyles: StyleMap
) => {
  const styles = styleNamesFromMap(allowedStyles)

  const html = convertToHTML({
    entityToHTML,
    styleToHTML: style => styleToHTML(style, styles),
    blockToHTML,
  })(currentContent)

  return html
}

/**
 * convert Html elements to Draft blocks
 */
export const htmlToBlock = (nodeName: string, _: HTMLElement) => {
  if (['body', 'ul', 'ol', 'tr'].includes(nodeName)) {
    // Nested elements are empty, wrap their children instead
    return {}
  } else {
    switch (nodeName) {
      case 'blockquote': {
        return {
          type: 'blockquote',
          element: 'blockquote',
        }
      }
      case 'h2': {
        return {
          type: 'header-two',
          element: 'h2',
        }
      }
      case 'h3': {
        return {
          type: 'header-three',
          element: 'h3',
        }
      }
      default: {
        return {
          type: 'unstyled',
          element: 'div',
        }
      }
    }
  }
}

/**
 * convert Html links to Draft entities
 */
export const htmlToEntity = (
  nodeName: string,
  _: HTMLLinkElement,
  createEntity: (
    blockType: string,
    isMutable: DraftEntityMutability,
    data: any
  ) => void
) => {
  if (nodeName === 'a') {
    const data = {
      url: node.href,
      className: node.classList ? node.classList.toString() : '',
    }

    return createEntity('LINK', 'MUTABLE', data)
  }
}

/**
 * convert Html styles to Draft styles
 */
export const htmlToStyle = (
  nodeName: string,
  currentStyle: any, // TODO: type OrderedSet
  allowedStyles: StyleMap
) => {
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
 * convert Draft styles to Html tags
 */
export const styleToHTML = (style: StyleName, allowedStyles: StyleMapNames) => {
  const isAllowed = allowedStyles.includes(style)
  const plainText = { start: '', end: '' }

  switch (style) {
    case 'BOLD':
      return isAllowed ? <b /> : plainText
    case 'ITALIC':
      return isAllowed ? <i /> : plainText
    case 'UNDERLINE':
      return isAllowed ? <u /> : plainText
    case 'STRIKETHROUGH':
      return isAllowed ? <s /> : plainText
    default:
      return plainText
  }
}

/**
 * convert Draft entities to Html links
 */
export const entityToHTML = (entity: RawDraftEntity, text: string) => {
  // TODO: add follow button
  if (entity.type === 'LINK') {
    return <a href={entity.data.url}>{text}</a>
  }
  return text
}

/**
 * convert Draft blocks to Html elements
 */
export const blockToHTML = (block: RawDraftContentBlock) => {
  if (block.type === 'blockquote') {
    return {
      start: '<blockquote>',
      end: '</blockquote>',
    }
  }
  if (block.type === 'header-two') {
    return {
      start: '<h2>',
      end: '</h2>',
    }
  }
  if (block.type === 'header-three') {
    return {
      start: '<h3>',
      end: '</h3>',
    }
  }
  // TODO: Fix type switching from draft-convert to avoid weird if statement
  if (block.type === 'ordered-list-item') {
    return {
      start: '<li>',
      end: '</li>',
      nestStart: '<ol>',
      nestEnd: '</ol>',
    }
  }
  if (block.type === 'unordered-list-item') {
    return {
      start: '<li>',
      end: '</li>',
      nestStart: '<ul>',
      nestEnd: '</ul>',
    }
  } else {
    // TODO: add all block types and limit by allowed styles
    return {
      start: '<p>',
      end: '</p>',
    }
  }
}
