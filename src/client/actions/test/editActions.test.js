import * as editActions from '../editActions'
import request from 'superagent'
import { cloneDeep } from 'lodash'
import Backbone from 'backbone'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
import Article from 'client/models/article.coffee'
import $ from 'jquery'
const { FeatureArticle } = Fixtures

jest.mock('superagent', () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.fn().mockReturnValue(
      {
        end: jest.fn()
      }
    )
  }
})

describe('editActions', () => {
  let article

  beforeEach(() => {
    window.location.assign = jest.fn()
    article = cloneDeep(FeatureArticle)
  })

  document.body.innerHTML = `
    <div>
      <div id="edit-sections-spinner" />
      <input id="edit-seo__focus-keyword" value="ceramics" />
    </div>'
  `

  describe('#onChangeArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({
        edit: { article },
        app: { channel: {type: 'editorial'} }
      }))
      dispatch = jest.fn()
    })

    it('calls #changeArticle with new attrs', () => {
      editActions.onChangeArticle('title', 'New Title')(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('title')
      expect(dispatch.mock.calls[0][0].payload.value).toBe('New Title')
    })

    it('calls debounced #updateArticle with new attrs', (done) => {
      editActions.onChangeArticle('title', 'New Title')(dispatch, getState)
      setTimeout(() => {
        expect(dispatch.mock.calls[1][0].type).toBe('UPDATE_ARTICLE')
        expect(dispatch.mock.calls[1][0].key).toBe('userCurrentlyEditing')
        expect(dispatch.mock.calls[1][0].payload.article).toBe(article.id)
        done()
      }, 550)
    })

    it('does not call #saveArticle if published', () => {
      editActions.onChangeArticle('title', 'New Title')(dispatch, getState)
      expect(dispatch.mock.calls.length).toBe(1)
    })

    it('calls debounced #saveArticle if draft', (done) => {
      article.published = false
      editActions.onChangeArticle('title', 'N')(dispatch, getState)
      editActions.onChangeArticle('title', 'Ne')(dispatch, getState)
      editActions.onChangeArticle('title', 'New')(dispatch, getState)

      setTimeout(() => {
        expect(dispatch.mock.calls.length).toBe(5)
        done()
      }, 550)
    })
  })

  describe('#onChangeHero', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({
        edit: { article }
      }))
      dispatch = jest.fn()
    })

    it('calls #changeArticle with new attrs', () => {
      editActions.onChangeHero('type', 'basic')(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('hero_section')
      expect(dispatch.mock.calls[0][0].payload.value.type).toBe('basic')
    })

    it('does not call #saveArticle if published', () => {
      editActions.onChangeHero('type', 'basic')(dispatch, getState)
      expect(dispatch.mock.calls.length).toBe(1)
    })

    it('calls debounced #saveArticle if draft', done => {
      article.published = false
      editActions.onChangeHero('deck', 'De')(dispatch, getState)
      editActions.onChangeHero('deck', 'Dec')(dispatch, getState)
      editActions.onChangeHero('deck', 'Deck')(dispatch, getState)

      setTimeout(() => {
        expect(dispatch.mock.calls.length).toBe(4)
        done()
      }, 550)
    })
  })

  describe('#onChangeSection', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({
        edit: { article }
      }))
      dispatch = jest.fn()
    })

    it('calls #changeArticle with new attrs', () => {
      editActions.onChangeSection('body', 'New Text')(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_SECTION')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('body')
      expect(dispatch.mock.calls[0][0].payload.value).toBe('New Text')
    })

    it('does not call #saveArticle if published', () => {
      editActions.onChangeSection('body', 'New Text')(dispatch, getState)
      expect(dispatch.mock.calls.length).toBe(1)
    })

    it('calls debounced #saveArticle if draft', done => {
      article.published = false
      editActions.onChangeSection('body', 'New')(dispatch, getState)
      editActions.onChangeSection('body', 'New Te')(dispatch, getState)
      editActions.onChangeSection('body', 'New Text')(dispatch, getState)

      setTimeout(() => {
        expect(dispatch.mock.calls.length).toBe(4)
        done()
      }, 550)
    })
  })

  it('#changeSavedStatus updates article and sets isSaved to arg', () => {
    article.title = 'Cool article'
    const action = editActions.changeSavedStatus(article, true)

    expect(action.type).toBe('CHANGE_SAVED_STATUS')
    expect(action.payload.isSaved).toBe(true)
    expect(action.payload.article.title).toBe('Cool article')
  })

  it('#setSection sets sectionIndex to arg', () => {
    const action = editActions.setSection(6)

    expect(action.type).toBe('SET_SECTION')
    expect(action.payload.sectionIndex).toBe(6)
  })

  it('#changeView sets the activeView to arg', () => {
    const action = editActions.changeView('display')

    expect(action.type).toBe('CHANGE_VIEW')
    expect(action.payload.activeView).toBe('display')
  })

  it('#redirectToList forwards to the articles list with published arg', () => {
    editActions.redirectToList(true)
    expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=true')

    editActions.redirectToList(false)
    expect(window.location.assign.mock.calls[1][0]).toBe('/articles?published=false')
  })

  it('#onFirstSave forwards to the article url', () => {
    editActions.onFirstSave('12345')

    expect(window.location.assign.mock.calls[0][0]).toBe('/articles/12345/edit')
  })

  it('#toggleSpinner shows/hides the loading spinner based on arg', () => {
    editActions.toggleSpinner(false)
    expect($('#edit-sections-spinner').css('display')).toBe('none')

    editActions.toggleSpinner(true)
    expect($('#edit-sections-spinner').css('display')).toBe('block')
  })

  describe('#deleteArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('#deleteArticle destroys the article and sets isDeleting', () => {
      editActions.deleteArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('DELETE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.isDeleting).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe('delete')
    })
  })

  describe('#saveArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Article.prototype.isNew = jest.fn().mockReturnValue(false)
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('Sets isSaving to true and saves the article', () => {
      editActions.saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('SAVE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.isSaving).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe('update')
    })

    it('Redirects to list if published', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[2][0].type).toBe('REDIRECT_TO_LIST')
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=true')
    })

    it('Does not redirect if unpublished', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.saveArticle()(dispatch, getState)

      expect(window.location.assign.mock.calls.length).toBe(0)
    })

    it('Sets seo_keyword if published', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.saveArticle()(dispatch, getState)
      expect(dispatch.mock.calls[1][0].type).toBe('SET_SEO_KEYWORD')
      expect(setArticleSpy.mock.calls[1][0].seo_keyword).toBe('ceramics')
    })

    it('Does not seo_keyword if unpublished', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('SET_SEO_KEYWORD')
      expect(setArticleSpy.mock.calls.length).toBe(1)
      expect(setArticleSpy.mock.calls[0][0].seo_keyword).toBeFalsy()
    })

    it('Redirects to article if new', () => {
      Article.prototype.isNew.mockReturnValueOnce(true)
      Backbone.sync = jest.fn(() => {
        editActions.onFirstSave('12345')
      })
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.saveArticle()(dispatch, getState)
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles/12345/edit')
    })
  })

  describe('#publishArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('Changes the publish status and saves the article', () => {
      getState = jest.fn(() => ({edit: {article: {published: false, id: '123'}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('PUBLISH_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.isPublishing).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe('update')
      expect(Backbone.sync.mock.calls[0][1].get('published')).toBe(true)
    })

    it('Sets seo_keyword if publishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('SET_SEO_KEYWORD')
      expect(setArticleSpy.mock.calls[2][0].seo_keyword).toBe('ceramics')
    })

    it('Does not seo_keyword if unpublishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('REDIRECT_TO_LIST')
      expect(Backbone.sync.mock.calls[0][1].get('seo_keyword')).toBeFalsy()
    })

    it('Redirects to published list if publishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[2][0].type).toBe('REDIRECT_TO_LIST')
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=true')
    })

    it('Redirects to drafts list if unpublishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('REDIRECT_TO_LIST')
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=false')
    })
  })

  describe('#newSection', () => {
    it('Can create an embed section', () => {
      const action = editActions.newSection('embed', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('embed')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
      expect(section.height).toBe('')
      expect(sectionIndex).toBe(3)
    })

    it('Can create an image_collection section', () => {
      const action = editActions.newSection('image_collection', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('image_collection')
      expect(section.images.length).toBe(0)
      expect(section.layout).toBe('overflow_fillwidth')
      expect(sectionIndex).toBe(3)
    })

    it('Can create a text section', () => {
      const action = editActions.newSection('text', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe('')
      expect(sectionIndex).toBe(3)
    })

    it('Can create a blockquote section', () => {
      const action = editActions.newSection('blockquote', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe('')
      expect(section.layout).toBe('blockquote')
      expect(sectionIndex).toBe(3)
    })

    it('Can create a video section', () => {
      const action = editActions.newSection('video', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('video')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
      expect(sectionIndex).toBe(3)
    })

    it('Can add attributes to a new section', () => {
      const body = '<p>The Precarious, Glamorous Lives of Independent Curators</p>'
      const action = editActions.newSection('blockquote', 3, { body })
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe(body)
      expect(section.layout).toBe('blockquote')
      expect(sectionIndex).toBe(3)
    })
  })

  describe('#newHeroSection', () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('Can create an image_collection section', () => {
      editActions.newHeroSection('image_collection')(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('hero_section')
      expect(dispatch.mock.calls[0][0].payload.value.type).toBe('image_collection')
    })

    it('Can create a video section', () => {
      editActions.newHeroSection('video')(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('hero_section')
      expect(dispatch.mock.calls[0][0].payload.value.type).toBe('video')
    })
  })

  it('#removeSection calls #onChangeArticle with new sections', () => {
    let dispatch = jest.fn()
    let getState = jest.fn(() => ({edit: { article }, app: {channel: { type: 'editorial' }}}))
    editActions.removeSection(6)(dispatch, getState)
    dispatch.mock.calls[0][0](dispatch, getState)

    expect(dispatch.mock.calls[1][0].type).toBe('CHANGE_ARTICLE')
    expect(dispatch.mock.calls[1][0].payload.key).toBe('sections')
    expect(dispatch.mock.calls[1][0].payload.value[6].body).toBe(article.sections[7].body)
    expect(dispatch.mock.calls[1][0].payload.value[5].body).toBe(article.sections[5].body)
    expect(dispatch.mock.calls[1][0].payload.value.length).toBe(article.sections.length - 1)
  })

  describe('Editing errors', () => {
    it('#logError sets error to arg', () => {
      const message = 'Error message'
      const action = editActions.logError({ message })

      expect(action.type).toBe('ERROR')
      expect(action.payload.error.message).toBe(message)
    })

    it('#resetError sets error to null', () => {
      const message = 'Error message'
      const action = editActions.resetError({ message })

      expect(action.type).toBe('ERROR')
      expect(action.payload.error).toBe(null)
    })
  })

  describe('#onAddFeaturedItem', () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('Can add a featured artist', () => {
      editActions.onAddFeaturedItem('artist', {_id: '123'})(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('primary_featured_artist_ids')
      expect(dispatch.mock.calls[0][0].payload.value[0]).toBe('123')
    })

    it('Can add a featured artwork', () => {
      editActions.onAddFeaturedItem('artwork', {_id: '123'})(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.key).toBe('featured_artwork_ids')
      expect(dispatch.mock.calls[0][0].payload.value[0]).toBe('123')
    })
  })

  describe('#onFetchArticleAuthors', () => {
    let getState
    let dispatch
    let response

    beforeEach(() => {
      response = {
        body: {
          data: {
            authors: [{
              id: '123',
              name: 'Casey Lesser'
            }]
          }
        }
      }

      getState = jest.fn(() => ({
        edit: { article },
        app: {
          apiUrl: 'http://stagingwriter.artsy.net/api',
          user: { access_token: 'asdf' }
        }
      }))
      dispatch = jest.fn()
    })

    it('Fetches article authors and calls #setArticleAuthors', () => {
      request.query().end.mockImplementation(() => {
        dispatch(editActions.setArticleAuthors(response.body.data.authors))
      })
      article.author_ids = ['123']
      editActions.onFetchArticleAuthors()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('SET_ARTICLE_AUTHORS')
      expect(dispatch.mock.calls[0][0].payload.authors[0].id).toBe('123')
      expect(dispatch.mock.calls[0][0].payload.authors[0].name).toBe('Casey Lesser')
    })
  })

  describe('#setArticleAuthors', () => {
    it('Can set article authors', () => {
      const authors = [{
        id: '123',
        name: 'Casey Lesser'
      }]
      const action = editActions.setArticleAuthors(authors)

      expect(action.type).toBe('SET_ARTICLE_AUTHORS')
      expect(action.payload.authors[0]).toBe(authors[0])
    })
  })

  describe('#setMentionedItems', () => {
    it('Can set mentioned artists', () => {
      const items = [{name: 'Joseph Beuys', _id: '123'}]
      const action = editActions.setMentionedItems('artist', items)

      expect(action.type).toBe('SET_MENTIONED_ITEMS')
      expect(action.payload.model).toBe('artist')
      expect(action.payload.items[0]).toBe(items[0])
    })

    it('Can set mentioned artworks', () => {
      const items = [{title: 'Stripes', _id: '123'}]
      const action = editActions.setMentionedItems('artwork', items)

      expect(action.type).toBe('SET_MENTIONED_ITEMS')
      expect(action.payload.model).toBe('artwork')
      expect(action.payload.items[0]).toBe(items[0])
    })
  })
})
