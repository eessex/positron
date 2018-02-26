import configureStore from 'redux-mock-store'
import request from 'superagent'
import { clone } from 'lodash'
import { mount, shallow } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { AutocompleteList } from '/client/components/autocomplete2/list'
import { AdminFeaturing } from '../../../components/featuring'
import { FeaturingMentioned } from '../../../components/featuring/featuring_mentioned'
import * as Queries from 'client/queries/metaphysics'
require('typeahead.js')

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

describe('AdminFeaturing', () => {
  let props
  let response

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const { article, featured, mentioned } = props

    const store = mockStore({
      app: {
        channel: { type: 'editorial' }
      },
      edit: {
        article,
        featured,
        mentioned
      }
    })

    return mount(
      <Provider store={store}>
        <AdminFeaturing {...props} />
      </Provider>
    )
  }

  const getShallowWrapper = (props) => {
    return shallow(
      <AdminFeaturing {...props} />
    )
  }

  beforeEach(() => {
    let article = clone(Fixtures.StandardArticle)
    props = {
      article,
      featured: {
        artist: [{
          _id: '123',
          name: 'Pablo Picasso'
        }],
        artwork: []
      },
      mentioned: {artist: [], artwork: []},
      metaphysicsURL: 'https://metaphysics-staging.artsy.net',
      model: 'artist',
      onChangeArticleAction: jest.fn()
    }

    response = {
      body: {
        data: {
          fairs: [{
            _id: '123',
            name: 'NADA New York'
          }]
        }
      }
    }

    request.get = jest.genMockFunction().mockReturnThis()
    request.set = jest.genMockFunction().mockReturnThis()
    request.query = jest.fn().mockReturnValue(
      {
        end: jest.fn()
      }
    )
  })

  it('Renders autocomplete fields', () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteList).length).toBe(4)
  })

  it('Renders feature/mentioned fields', () => {
    const component = getWrapper(props)
    expect(component.find(FeaturingMentioned).length).toBe(2)
  })

  describe('#getQuery', () => {
    it('Returns the correct query for fairs', () => {
      const component = getShallowWrapper(props)
      const query = component.instance().getQuery('fairs')

      expect(query).toBe(Queries.FairsQuery)
    })

    it('Returns the correct query for partners', () => {
      const component = getShallowWrapper(props)
      const query = component.instance().getQuery('partners')

      expect(query).toBe(Queries.PartnersQuery)
    })

    it('Returns the correct query for shows', () => {
      const component = getShallowWrapper(props)
      const query = component.instance().getQuery('partner_shows')

      expect(query).toBe(Queries.PartnersQuery)
    })

    it('Returns the correct query for auctions', () => {
      const component = getShallowWrapper(props)
      const query = component.instance().getQuery('sales')

      expect(query).toBe(Queries.AuctionsQuery)
    })
  })

  it('#idsToFetch returns unfetched ids based on field and fetchedItems', () => {
    props.article.fair_ids = ['123', '456']
    const component = getShallowWrapper(props)
    const idsToFetch = component.instance().idsToFetch('fair_ids', [{id: '123'}])

    expect(idsToFetch.length).toBe(1)
    expect(idsToFetch[0]).toBe('456')
  })

  describe('#fetchItems', () => {
    it('Calls query with ids to fetch', () => {
      const query = jest.fn()
      props.article.fair_ids = ['123', '456']
      const component = getShallowWrapper(props)
      component.instance().getQuery = jest.fn(() => {
        return query
      })
      component.instance().fetchItems('fairs', 'fair_ids', [], jest.fn())

      expect(component.instance().getQuery.mock.calls[0][0]).toBe('fairs')
      expect(query.mock.calls[0][0].length).toBe(props.article.fair_ids.length)
      expect(query.mock.calls[0][0][0]).toBe(props.article.fair_ids[0])
    })

    it('Calls #idsToFetch', () => {
      props.article.fair_ids = ['123', '456']
      const component = getShallowWrapper(props)
      component.instance().idsToFetch = jest.fn(() => (['456']))
      component.instance().fetchItems('fairs', 'fair_ids', ['123'], jest.fn())

      expect(component.instance().idsToFetch.mock.calls[0][0]).toBe('fair_ids')
      expect(component.instance().idsToFetch.mock.calls[0][1][0]).toBe('123')
    })

    it('Makes a request to metaphysics', () => {
      props.article.fair_ids = ['123', '456']
      request.query().end.mockImplementation(() => {
        return response.body.data.fairs
      })
      const component = getShallowWrapper(props)
      component.instance().fetchItems('fairs', 'fair_ids', ['123'], jest.fn())

      expect(request.get.mock.calls[0][0]).toBe(props.metaphysicsURL)
      expect(request.query().end).toBeCalled()
    })

    it('Does not request if no idsToFetch', () => {
      props.article.fair_ids = []
      const component = getShallowWrapper(props)
      component.instance().fetchItems('fairs', 'fair_ids', [], jest.fn())

      expect(request.get).not.toBeCalled()
    })

    it('Calls the cb with data', () => {
      const cb = jest.fn()
      props.article.fair_ids = ['123', '456']
      request.query().end.mockImplementation(() => {
        return cb(response.body.data.fairs)
      })
      const component = getShallowWrapper(props)
      component.instance().fetchItems('fairs', 'fair_ids', ['123'], cb)

      expect(cb.mock.calls[0][0][0]._id).toBe('123')
      expect(cb.mock.calls[0][0][0].name).toBe('NADA New York')
    })
  })
})
