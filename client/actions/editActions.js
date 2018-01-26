import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_VIEW',
  'DELETE_ARTICLE',
  'ERROR',
  'NEW_SECTION',
  'ON_CHANGE_SECTION',
  'PUBLISH_ARTICLE',
  'REMOVE_SECTION',
  'RESET_SECTIONS',
  'SAVE_ARTICLE',
  'SAVE_ARTICLE_PENDING',
  'SAVE_ARTICLE_SUCCESS',
  'SAVE_ARTICLE_ERROR',
  'SET_SECTION'
)

export const changeSavedStatus = (article, isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    article,
    isSaved,
    lastUpdated: new Date()
  }
})

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

export const deleteArticle = (article) => {
  article.destroy({
    success: () => {
      article.trigger('finished')
    }
  })

  return {
    type: actions.DELETE_ARTICLE,
    payload: {
      isDeleting: true
    }
  }
}

export const setSection = (sectionIndex) => ({
  // Index of article section currently editing
  type: actions.SET_SECTION,
  payload: {
    sectionIndex
  }
})

export const newSection = (type, sectionIndex) => {
  const section = setupSection(type)

  return {
    type: actions.NEW_SECTION,
    payload: {
      section,
      sectionIndex
    }
  }
}

export const onChangeSection = (key, value) => {
  return {
    type: actions.ON_CHANGE_SECTION,
    payload: {
      key,
      value
    }
  }
}

export const publishArticle = (article, published) => {
  article.set('published', published)
  article.save()
  article.trigger('finished')

  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const removeSection = (sectionIndex) => ({
  type: actions.REMOVE_SECTION,
  payload: {
    sectionIndex
  }
})

export const resetSections = (sections) => ({
  type: actions.RESET_SECTIONS,
  payload: {
    sections
  }
})

export const saveArticle = (article) => {
  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      article,
      success: actions.SAVE_ARTICLE_SUCCESS,
      error: actions.SAVE_ARTICLE_ERROR
    }
  }
}

export const onSaveArticle = () => {
  return (dispatch, getState) => {
    const { article } = getState().edit

    dispatch(saveArticlePending())
    dispatch(saveArticle(article))
  }
}

export const saveArticlePending = () => {
  return {
    type: actions.SAVE_ARTICLE_PENDING,
    payload: {
      isSaving: true
    }
  }
}

export const saveArticleSuccess = () => {
  debugger
  return {
    type: actions.SAVE_ARTICLE_SUCCESS,
    payload: {
      isSaving: false
    }
  }
}

export const saveArticleError = (error) => {
  debugger
  return {
    type: actions.SAVE_ARTICLE_ERROR,
    payload: {
      isSaving: false,
      error
    }
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

// ACTION UTILS
export function setupSection (type) {
  // set initial state of new section
  switch (type) {
    case 'video':
      return {
        type: 'video',
        url: '',
        layout: 'column_width'
      }
    case 'image_collection':
      return {
        type: 'image_collection',
        layout: 'overflow_fillwidth',
        images: []
      }
    case 'embed':
      return {
        type: 'embed',
        url: '',
        layout: 'column_width',
        height: ''
      }
    case 'text':
      return {
        type: 'text',
        body: ''
      }
  }
}
