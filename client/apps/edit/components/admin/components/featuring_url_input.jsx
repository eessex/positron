import request from 'superagent'
import { last } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { onAddFeature } from 'client/actions/editActions'
import * as Queries from 'client/queries/metaphysics'

export class FeaturingUrlInput extends Component {
  static propTypes = {
    label: PropTypes.string,
    metaphysicsURL: PropTypes.string,
    model: PropTypes.string,
    onAddFeatureAction: PropTypes.func,
    user: PropTypes.object
  }

  state = {
    value: ''
  }

  fetchItem = (id) => {
    const {
      metaphysicsURL,
      model,
      onAddFeatureAction,
      user
    } = this.props

    let query
    if (model === 'artist') {
      query = Queries.ArtistQuery
    } else {
      query = Queries.ArtworkQuery
    }

    request
      .get(`${metaphysicsURL}`)
      .set({
        'Accept': 'application/json',
        'X-Access-Token': (user && user.access_token)
      })
      .query({ query: query(id) })
      .end((err, res) => {
        if (err) {
          console.error(err)
        }
        onAddFeatureAction(model, res.body.data[model])
        this.setState({loading: false, value: ''})
      })
  }

  onFeature = (value) => {
    const id = last(value.split('/'))

    this.setState({loading: true})
    this.fetchItem(id)
  }

  render () {
    const { label, model } = this.props
    const { value } = this.state

    return (     
      <div className='field-group'>
        <label>{label}</label>
        <input
          className='bordered-input'
          value={value}
          onChange={(e) => this.setState({value: e.target.value})}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              this.onFeature(e.target.value)
            }
          }}
          placeholder={`Add an ${model} by slug or URL...`}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onAddFeatureAction: onAddFeature
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FeaturingUrlInput)
