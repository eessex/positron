import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { DisplayPartner } from './components/partner'
import { DropDownList } from 'client/components/drop_down/drop_down_list'
import DisplayEmail from './components/email'
import DisplayMagazine from './components/magazine'
import DisplaySearch from './components/search'
import DisplaySocial from './components/social'

export class EditDisplay extends Component {
  static propTypes = {
    article: PropTypes.object,
    channel: PropTypes.object,
    onChange: PropTypes.func
  }

  render () {
    const { article, channel, onChange } = this.props
    const sections = [
      {title: 'Magazine'},
      {title: 'Social'},
      {title: 'Search'},
      {title: 'Email'}
    ]

    const isPartner = channel.type === 'partner'

    return (
      <EditDisplayContainer
        className='EditDisplay'
        margin={isPartner ? 55 : 95}
      >
        {isPartner
          ? <DisplayPartner
              article={article}
              onChange={onChange}
            />

          : <DropDownList
              className='admin-form-container max-width-container'
              activeSections={[0]}
              openMany
              sections={sections}
            >
              <DisplayMagazine />

              <DisplaySocial />

              <DisplaySearch />

              <DisplayEmail />

            </DropDownList>
        }
      </EditDisplayContainer>
    )
  }
}

const EditDisplayContainer = styled.div`
  margin-top: ${props => `${props.margin}px`};
`
