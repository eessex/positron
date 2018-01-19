import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Icon from '@artsy/reaction-force/dist/Components/Icon'

export class Yoast extends Component {
  static propTypes = {
    article: PropTypes.object
  }

  state = {
    isOpen: false
  }

  render () {
    const { article } = this.props
    const { isOpen } = this.state

    return (
      <div id='edit-seo' className='Yoast'>
        <div
          className='YoastHeader edit-seo__header-container'
          onClick={() => this.setState({ isOpen: !isOpen })}
        >
          <div className='edit-seo__header'>
            Seo Analysis -
            <span className='edit-seo__unresolved-msg' />
          </div>
          <div
            className='edit-seo__close'
            data-open={!isOpen}
          >
            <Icon name='follow-circle' color='black' />
          </div>
          <div id='edit-seo__snippet' />
        </div>

        {isOpen &&
          <div id='yoast-container' className='YoastContainer'>
            <div className='yoast-container__left'>
              <label>Target Keyword</label>
              <input
                className='bordered-input'
                value={article.get('seo_keyword')}
              />
              <input id='edit-seo__content-field' />
              <div id='edit-seo__snippet' />
            </div>

            <div className='yoast-container__right'>
              <div id='edit-seo__output' />
            </div>
          </div>
        }
      </div>
    )
  }
}
