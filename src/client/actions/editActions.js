
import { cloneDeep, extend } from 'lodash'
import keyMirror from 'client/lib/keyMirror'
import { emitAction } from 'client/apps/websocket/client'
import { messageTypes } from 'client/apps/websocket/messageTypes'
import $ from 'jquery'

import {
  actions as articleActions,
  changeArticleData
} from './edit/articleActions'
import { actions as sectionActions } from './edit/sectionActions'

export const actions = extend(
  keyMirror(
    'CHANGE_VIEW',
    'UPDATE_ARTICLE',
    'START_EDITING_ARTICLE',
    'STOP_EDITING_ARTICLE',
    'ERROR',
    'REDIRECT_TO_LIST',
    'RESET_SECTIONS',
    'SET_MENTIONED_ITEMS',
    'TOGGLE_SPINNER'
  ),
  articleActions,
  sectionActions
)

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

export const startEditingArticle = emitAction((data) => {
  return {
    type: actions.START_EDITING_ARTICLE,
    key: messageTypes.userStartedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const updateArticle = emitAction((data) => {
  return {
    type: actions.UPDATE_ARTICLE,
    key: messageTypes.userCurrentlyEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const stopEditingArticle = emitAction((data) => {
  return {
    type: actions.STOP_EDITING_ARTICLE,
    key: messageTypes.userStoppedEditing,
    payload: {
      timestamp: new Date().toISOString(),
      ...data
    }
  }
})

export const redirectToList = (published) => {
  window.location.assign(`/articles?published=${published}`)

  return {
    type: actions.REDIRECT_TO_LIST
  }
}

export const onAddFeaturedItem = (model, item) => {
  return (dispatch, getState) => {
    const { edit: { article } } = getState()
    const key = model === 'artist' ? 'primary_featured_artist_ids' : 'featured_artwork_ids'
    let newFeaturedIds = cloneDeep(article)[key] || []

    newFeaturedIds.push(item._id)
    dispatch(changeArticleData(key, newFeaturedIds))
  }
}

export const setMentionedItems = (model, items) => {
  return {
    type: actions.SET_MENTIONED_ITEMS,
    payload: {
      model,
      items
    }
  }
}

export const toggleSpinner = (isVisible) => {
  if (isVisible) {
    $('#edit-sections-spinner').show()
  } else {
    $('#edit-sections-spinner').hide()
  }

  return {
    type: actions.TOGGLE_SPINNER
  }
}

// EDITING ERRORS
export const logError = (error) => ({
  type: actions.ERROR,
  payload: {
    error
  }
})

export const resetError = () => ({
  type: actions.ERROR,
  payload: {
    error: null
  }
})
