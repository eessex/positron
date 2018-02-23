import request from 'superagent'
import { clone, uniq } from 'lodash'
import { connect } from 'react-redux'
import { difference, flatten, pluck } from 'underscore'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { AutocompleteList } from '/client/components/autocomplete2/list'
import { FeaturingMentioned } from './featuring_mentioned'
import * as Queries from 'client/queries/metaphysics'

export class AdminFeaturing extends Component {
  static propTypes = {
    article: PropTypes.object,
    artsyURL: PropTypes.string,
    metaphysicsURL: PropTypes.string,
    onChangeArticleAction: PropTypes.func,
    user: PropTypes.object
  }

  getQuery = (model) => {
    switch (model) {
      case 'sales': {
        return Queries.AuctionsQuery
      }
      case 'fairs': {
        return Queries.FairsQuery
      }
      case 'partners': {
        return Queries.PartnersQuery
      }
      case 'partner_shows': {
        return Queries.PartnersQuery
      }
    }
  }

  idsToFetch = (field, fetchedItems) => {
    const { article } = this.props
    let allIds = clone(article[field])
    const alreadyFetched = pluck(fetchedItems, 'id')

    return difference(allIds, alreadyFetched)
  }

  fetchItems = (model, field, fetchedItems, cb) => {
    const { metaphysicsURL, user } = this.props
    let newItems = clone(fetchedItems)
    const query = this.getQuery(model)
    const idsToFetch = this.idsToFetch(field, fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${metaphysicsURL}`)
        .set({
          'Accept': 'application/json',
          'X-Access-Token': (user && user.access_token)
        })
        .query({ query: query(idsToFetch) })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          newItems.push(res.body.data[model])
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  render () {
    const {
      article,
      artsyURL,
      onChangeArticleAction
    } = this.props

    return (
      <div>
        <Row>
          <Col xs={6}>
            <div className='field-group'>
              <label>Partners</label>
              <AutocompleteList
                fetchItems={(fetchedItems, cb) => this.fetchItems(
                  'partners', 'partner_ids', fetchedItems, cb
                )}
                items={article.partner_ids || []}
                filter={(items) => {
                  return items.map((item) => {
                    return { id: item._id, name: item.name }
                  })
                }}
                onSelect={(results) => onChangeArticleAction('partner_ids', results)}
                placeholder='Search by partner name...'
                url={`${artsyURL}/api/v1/match/partners?term=%QUERY`}
              />
            </div>
          </Col>

          <Col xs={6}>
            <div className='field-group'>
              <label>Fairs</label>
              <AutocompleteList
                fetchItems={(fetchedItems, cb) => this.fetchItems(
                  'fairs', 'fair_ids', fetchedItems, cb
                )}
                items={article.fair_ids || []}
                filter={(items) => {
                  return items.map((item) => {
                    return { id: item._id, name: item.name }
                  })
                }}
                onSelect={(results) => onChangeArticleAction('fair_ids', results)}
                placeholder='Search by fair name...'
                url={`${artsyURL}/api/v1/match/fairs?term=%QUERY`}
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <div className='field-group'>
              <label>Shows</label>
              <AutocompleteList
                fetchItems={(fetchedItems, cb) => this.fetchItems(
                  'partner_shows', 'show_ids', fetchedItems, cb
                )}
                items={article.show_ids || []}
                filter={(items) => {
                  return items.map((item) => {
                    return { id: item._id, name: item.name }
                  })
                }}
                onSelect={(results) => onChangeArticleAction('show_ids', results)}
                placeholder='Search by show name...'
                url={`${artsyURL}/api/v1/match/partner_shows?term=%QUERY`}
              />
            </div>
          </Col>

          <Col xs={6}>
            <div className='field-group'>
              <label>Auctions</label>
              <AutocompleteList
                fetchItems={(fetchedItems, cb) => this.fetchItems(
                  'sales', 'auction_ids', fetchedItems, cb
                )}
                items={article.auction_ids || []}
                filter={(items) => {
                  return items.map((item) => {
                    return { id: item._id, name: item.name }
                  })
                }}
                onSelect={(results) => onChangeArticleAction('auction_ids', results)}
                placeholder='Search by auction name...'
                url={`${artsyURL}/api/v1/match/sales?term=%QUERY`}
              />
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            <FeaturingMentioned model='artist' />
          </Col>

          <Col xs={6}>
            <FeaturingMentioned model='artwork' />
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  artsyURL: state.app.artsyURL,
  article: state.edit.article,
  metaphysicsURL: state.app.metaphysicsURL,
  user: state.app.user
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminFeaturing)
