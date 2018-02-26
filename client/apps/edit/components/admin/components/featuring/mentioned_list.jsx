import colors from '@artsy/reaction-force/dist/Assets/Colors'
import { connect } from 'react-redux'
import { pluck } from 'underscore'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  getMentionedArtists,
  getMentionedArtworks,
  onAddFeature
} from 'client/actions/editActions.js'
import { ListItem } from 'client/components/autocomplete2/list'

export class MentionedList extends Component {
  static propTypes = {
    featured: PropTypes.object,
    getMentionedArtistsAction: PropTypes.func,
    getMentionedArtworksAction: PropTypes.func,
    mentioned: PropTypes.object,
    model: PropTypes.string,
    onAddFeatureAction: PropTypes.func
  }

  componentWillMount = () => {
    const {
      getMentionedArtistsAction,
      getMentionedArtworksAction,
      model
    } = this.props

    if (model === 'artist') {
      getMentionedArtistsAction()
    } else {
      getMentionedArtworksAction()
    }
  }

  notFeaturedArray = () => {
    const { mentioned, model } = this.props
    let canBeFeatured = []

    mentioned[model].map((item) => {
      if (!this.isFeatured(item._id)) {
        canBeFeatured.push(item)
      }
    })
    return canBeFeatured
  }

  isFeatured = (id) => {
    const { featured, model } = this.props
    const isFeatured = pluck(featured[model], '_id')

    return isFeatured.includes(id)
  }

  featureAll = () => {
    const { model, onAddFeatureAction } = this.props

    this.notFeaturedArray().map((item) => {
      onAddFeatureAction(model, item)
    })
  }

  renderItem = (item, index) => {
    const { model, onAddFeatureAction } = this.props
    const { _id, name } = item

    if (!this.isFeatured(_id)) {
      return (
        <ListItem
          className='MentionedList__item'
          color={colors.grayDark}
          key={_id}
          onClick={() => onAddFeatureAction(model, item)}
        >
          {name}
          <span className='mention' />
        </ListItem>
      )
    }
  }

  renderFeatureAll = () => {
    const { model } = this.props
    const hasMentioned = this.notFeaturedArray().length > 0

    if (hasMentioned) {
      return (
        <div
          className='field-group field-group--inline flat-checkbox'
          onClick={() => this.featureAll()}
        >
          <input
            type='checkbox'
            readOnly
          />
          <label>Feature all mentioned {`${model}s`}</label>
        </div>
      )
    }
  }

  render () {
    return (
      <div className='MentionedList'>
        {this.renderFeatureAll()}
        {this.notFeaturedArray().map((item, index) => this.renderItem(item, index))}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  featured: state.edit.featured,
  mentioned: state.edit.mentioned,
  user: state.app.user
})

const mapDispatchToProps = {
  getMentionedArtistsAction: getMentionedArtists,
  getMentionedArtworksAction: getMentionedArtworks,
  onAddFeatureAction: onAddFeature
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MentionedList)
