import PropTypes from 'prop-types'
import React, { Component } from 'react'
import MentionedList from './mentioned_list'
import MetaphysicsAutocomplete from '../metaphysics_autocomplete'

export class FeaturingMentioned extends Component {
  static propTypes = {
    model: PropTypes.string
  }

  render () {
    const { model } = this.props

    const field = model === 'artist'
      ? 'primary_featured_artist_ids'
      : 'featured_artwork_ids'

    return (
      <div className='FeaturingMentioned'>
          <MetaphysicsAutocomplete
            field={field}
            model={`${model}s`}
          />
        <MentionedList model={model} />
      </div>
    )
  }
}
