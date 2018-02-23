import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { clone } from 'lodash'
import { mount, shallow } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { AdminFeaturing } from '../../../components/featuring'

describe('AdminFeaturing', () => {
  let props
  let section

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
        <section>
          <AdminFeaturing {...props} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    let article = clone(Fixtures.StandardArticle)
    props = {
      article,
      featured: {artist: [], artwork: []},
      mentioned: {artist: [], artwork: []},
      onChangeArticleAction: jest.fn()
    }
  })

  it('Renders autocomplete fields', () => {
    const component = getWrapper(props)
    console.log(component.html())
  })
})
