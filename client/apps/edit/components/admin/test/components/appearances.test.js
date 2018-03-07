
import configureStore from 'redux-mock-store'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { Provider } from 'react-redux'
import { AdminAppearances } from '../../components/appearances'
import { MetaphysicsAutocomplete } from '../../components/metaphysics_autocomplete'
require('typeahead.js')

describe('FeaturingMentioned', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const { article } = props

    const store = mockStore({
      app: {
        channel: { type: 'editorial' }
      },
      edit: { article }
    })

    return mount(
      <Provider store={store}>
        <AdminAppearances {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(Fixtures.StandardArticle)
    }
  })

  it('Renders autocomplete components', () => {
    const component = getWrapper(props)
    expect(component.find(MetaphysicsAutocomplete).length).toBe(4)
  })
})
