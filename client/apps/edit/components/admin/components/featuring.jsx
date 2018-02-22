import async from 'async'
import request from 'superagent'
import { clone, last, uniq } from 'lodash'
import { connect } from 'react-redux'
import { difference, flatten, pluck } from 'underscore'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { AutocompleteList } from '/client/components/autocomplete2/list'
import { AuctionsQuery } from 'client/queries/auctions'
import FeaturingUrlInput from './featuring_url_input'
import FeaturingList from './featuring_list'
import * as Queries from 'client/queries/metaphysics'

export class AdminFeaturing extends Component {
  static propTypes = {
    article: PropTypes.object,
    artsyURL: PropTypes.string,
    onChangeArticleAction: PropTypes.func,
    user: PropTypes.object
  }

  onChangeAuthor = (name) => {
    const { article, onChangeArticleAction } = this.props
    const author = clone(article.author)

    author.name = name
    onChangeArticleAction('author', author)
  }

  fetchItems = (idsToFetch, cb) => {
    let fetchedItems = []
    async.each(idsToFetch, (id, cb) => {
      debugger
    })
    cb()
  }

  fetchAuctions = (fetchedItems, cb) => {
    return fetchedItems

    // .get(`${apiURL}/graphql`)
    // .set({
    //   'Accept': 'application/json',
    //   'X-Access-Token': (user && user.access_token)
    // })
    // .query({ query: AuthorsQuery(idsToFetch) })
    // .end((err, res) => {
    //   if (err) {
    //     console.error(err)
    //   }
    //   newItems.push(res.body.data.authors)
    //   const uniqItems = uniq(flatten(newItems))
    //   cb(uniqItems)
    // })
  }

  fetchPartners = (fetchedItems, cb) => {
    const { artsyURL, article, metaphysicsURL, user } = this.props
    const { author_ids } = article

    const alreadyFetched = pluck(fetchedItems, 'id')
    const idsToFetch = difference(author_ids, alreadyFetched)
    let newItems = clone(fetchedItems)

    if (idsToFetch.length) {
      this.fetchItems(idsToFetch, () => {
        debugger
      })
      // idsToFetch.map((partnerId) => {
      //   request
      //   .get(`${metaphysicsURL}`)
      //   .set({
      //     'Accept': 'application/json',
      //     'X-Access-Token': (user && user.access_token)
      //   })
      //   .query({ query: AuctionsQuery(idsToFetch) })
      //   .end((err, res) => {
      //     if (err) {
      //       console.error(err)
      //     }
      //     // newItems.push(res.body.data.authors)
      //     const uniqItems = uniq(flatten(newItems))
      //     cb(uniqItems)
      //   })
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
              {/* <AutocompleteList
                fetchItems={this.fetchPartners}
                items={article.partner_ids || []}
                filter={(items) => {
                  return items.results.map((item) => {
                    return { id: item._id, name: item.name }
                  })
                }}
                onSelect={(results) => onChangeArticleAction('partner_ids', results)}
                placeholder='Search by partner name...'
                url={`${artsyURL}/api/v1/match/partners?term=%QUERY`}
              /> */}
            </div>
          </Col>

          <Col xs={6}>
            <div className='field-group'>
              <label>Auctions</label>
              <AutocompleteList
                fetchItems={this.fetchAuctions}
                items={article.auction_ids || []}
                filter={(items) => {
                  return items.map((item) => {
                    return { id: item._id, name: item.name }
                  })
                }}
                onSelect={(results) => onChangeArticleAction('auction_ids', results)}
                placeholder='Search by partner name...'
                url={`${artsyURL}/api/v1/match/sales?term=%QUERY`}
              />
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            <FeaturingUrlInput
              label='Artists'
              model='artist'
            />
            <FeaturingList model='artist' />
          </Col>

          <Col xs={6}>
            <FeaturingUrlInput
              label='Artworks'
              model='artwork'
            />
            <FeaturingList model='artwork' />
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
