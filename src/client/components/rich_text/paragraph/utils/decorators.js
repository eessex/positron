import PropTypes from 'prop-types'
import React from 'react'
import { CompositeDecorator } from 'draft-js'

export const decorators = linked => {
  /**
   * Used when creating an editor, determines
   * which entities are allowed, and how find
   * and render them in the Editor component
   */
  let decorators = []

  if (linked) {
    decorators.push({
      strategy: findLinkEntities,
      component: Link
    })
  }
  return new CompositeDecorator(decorators)
}

export const findLinkEntities = (contentBlock, callback, contentState) => {
  /**
   * Used by decorator to find existing link entities from a contentBlock
   */
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      )
    },
    callback
  )
}

const Link = props => {
  /**
   * Used by decorator to render links in draft's Editor component
   */
  const { children, contentState, entityKey } = props
  const { url } = contentState.getEntity(entityKey).getData()
  // Don't allow links to click through from editor
  const onClick = e => e.preventDefault()

  return (
    <a href={url} onClick={onClick}>
      {children}
    </a>
  )
}

Link.propTypes = {
  children: PropTypes.any,
  contentState: PropTypes.object,
  entityKey: PropTypes.string
}
