import request from 'superagent'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { onFetchFeatured, onRemoveFeature } from 'client/actions/editActions.js'
import * as Queries from 'client/queries/metaphysics'

export class FeaturingList extends Component {
  static propTypes = {
    article: PropTypes.object,
    featured: PropTypes.object,
    metaphysicsURL: PropTypes.string,
    model: PropTypes.string,
    onFetchFeaturedAction: PropTypes.func,
    onRemoveFeatureAction: PropTypes.func,
    user: PropTypes.object
  }

  componentWillMount = () => {
    this.fetchFeatured()
  }

  fetchFeatured = () => {
    const {
      article,
      model,
      metaphysicsURL,
      onFetchFeaturedAction,
      user
    } = this.props
    let query
    let key

    if (model === 'artist') {
      return false
      // key = 'primary_featured_artist_ids'
      // query = Queries.ArtistsQuery
    } else {
      key = 'featured_artwork_ids'
      query = Queries.ArtworksQuery
    }
    const ids = article[key]
    if (ids && ids.length) {
      request
        .get(`${metaphysicsURL}`)
        .set({
          'Accept': 'application/json',
          'X-Access-Token': (user && user.access_token)
        })
        .query({ query: query(ids) })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          const items = res.body.data[`${model}s`]
          onFetchFeaturedAction(model, items)
          this.setState({loading: false, value: ''})
        })
    }
  }

  renderItem = (item, index) => {
    const { model, onRemoveFeatureAction } = this.props
    const { _id, name, title } = item
    const text = model === 'artist' ? name : title

    return (
      <div
        className='FeaturingList__item'
        key={_id}
      >
        <span className='selected'>
          {text}
        </span>
        <button
          className='remove-button'
          onClick={() => onRemoveFeatureAction(model, item, index)}
        />
      </div>
    )
  }

  render () {
    const { featured, model } = this.props

    return (
      <div className='FeaturingList'>
        {featured[model].map((item, index) => this.renderItem(item, index))}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  featured: state.edit.featured,
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onFetchFeaturedAction: onFetchFeatured,
  onRemoveFeatureAction: onRemoveFeature
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturingList)
