import * as editActions from '../editActions'
import { cloneDeep } from 'lodash'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
import $ from 'jquery'
const { FeatureArticle } = Fixtures

describe('editActions', () => {
  let article

  beforeEach(() => {
    window.location.assign = jest.fn()
    article = cloneDeep(FeatureArticle)
  })

  document.body.innerHTML = `
    <div>
      <div id="edit-sections-spinner" />
    </div>'
  `

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

  it('#toggleSpinner shows/hides the loading spinner based on arg', () => {
    editActions.toggleSpinner(false)
    expect($('#edit-sections-spinner').css('display')).toBe('none')

    editActions.toggleSpinner(true)
    expect($('#edit-sections-spinner').css('display')).toBe('block')
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
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[1][0].payload.data.primary_featured_artist_ids[0]).toBe('123')
    })

    it('Can add a featured artwork', () => {
      editActions.onAddFeaturedItem('artwork', {_id: '123'})(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('CHANGE_ARTICLE')
      expect(dispatch.mock.calls[1][0].payload.data.featured_artwork_ids[0]).toBe('123')
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
