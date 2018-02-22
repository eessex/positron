import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { onRemoveFeature } from 'client/actions/editActions'

export class FeaturingList extends Component {
  static propTypes = {
    featured: PropTypes.object,
    metaphysicsURL: PropTypes.string,
    model: PropTypes.string,
    onRemoveFeatureAction: PropTypes.func,
    user: PropTypes.object
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
  featured: state.edit.featured,
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onRemoveFeatureAction: onRemoveFeature
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturingList)
