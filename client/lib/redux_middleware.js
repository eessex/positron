import { cloneDeep } from 'lodash'
import Article from 'client/models/article.coffee'

export const reduxMiddleware = ({ dispatch }) => next => action => {
  if (action.type === 'SAVE_ARTICLE') {
    const newArticle = new Article(cloneDeep(action.payload.article))
    newArticle.save()
    debugger
    return dispatch(action.payload.success)
  }
  return next(action)
}
