import colors from '@artsy/reaction-force/dist/Assets/Colors'
import { connect } from 'react-redux'
import { uniq } from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { onAddFeature, setMentioned } from 'client/actions/editActions.js'
import * as ArticleUtils from 'client/models/article.js'
import Artists from 'client/collections/artists.coffee'
import Artworks from 'client/collections/artworks.coffee'
import { ListItem } from 'client/components/autocomplete2/list'

export class MentionedList extends Component {
  static propTypes = {
    article: PropTypes.object,
    mentioned: PropTypes.object,
    model: PropTypes.string,
    onAddFeatureAction: PropTypes.func,
    setMentionedAction: PropTypes.func
  }

  componentWillMount = () => {
    const { model } = this.props

    if (model === 'artist') {
      this.getMentionedArtists()
    } else {
      this.getMentionedArtworks()
    }
  }

  getMentionedArtists = () => {
    const { article, setMentionedAction } = this.props
    const artists = new Artists()
    const ids = ArticleUtils.getMentionedArtistSlugs(article)

    artists.getOrFetchIds(ids, {
      success: () => {
        const denormalizedArtists = artists.models.map((item) => {
          return { _id: item.get('_id'), name: item.get('name') }
        })
        setMentionedAction('artist', denormalizedArtists)
      }
    })
  }

  getMentionedArtworks = () => {
    const { article, setMentionedAction } = this.props
    const artworks = new Artworks()
    const ids = ArticleUtils.getMentionedArtworkSlugs(article)

    artworks.getOrFetchIds(ids, {
      success: () => {
        const denormalizedArtworks = artworks.models.map((item) => {
          return { _id: item.get('_id'), name: item.get('title') }
        })
        setMentionedAction('artwork', denormalizedArtworks)
      }
    })
  }

  notFeaturedArray = () => {
    const { mentioned, model } = this.props
    let canBeFeatured = []

    mentioned[model].map((item) => {
      if (!this.isFeatured(item._id)) {
        canBeFeatured.push(item)
      }
    })
    return uniq(canBeFeatured)
  }

  isFeatured = (id) => {
    const { article, model } = this.props
    let key

    if (model === 'artist') {
      key = 'primary_featured_artist_ids'
    } else {
      key = 'featured_artwork_ids'
    }

    return article[key].includes(id)
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
  article: state.edit.article,
  mentioned: state.edit.mentioned,
  user: state.app.user
})

const mapDispatchToProps = {
  onAddFeatureAction: onAddFeature,
  setMentionedAction: setMentioned
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MentionedList)
