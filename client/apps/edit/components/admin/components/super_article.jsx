import { connect } from 'react-redux'
import { Col, Row } from 'react-styled-flexboxgrid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Autocomplete } from '/client/components/autocomplete2'
import { onChangeArticle } from 'client/actions/editActions'
import ImageUpload from './image_upload.coffee'

export class AdminSuperArticle extends Component {
  static propTypes = {
    article: PropTypes.object,
    apiURL: PropTypes.string,
    onChangeArticleAction: PropTypes.func
  }

  onChange = (key, value) => {
    debugger
    const { article, onChangeArticleAction } = this.props
    const super_article = article.super_article || {}

    super_article[key] = value
    onChangeArticleAction('super_article', super_article)
  }

  render () {
    const { article, apiURL, onChangeArticleAction } = this.props
    const super_article = article.super_article || {}
    const {
      footer_blurb,
      footer_title,
      partner_fullscreen_header_logo,
      partner_link,
      partner_link_title,
      partner_logo,
      partner_logo_link,
      related_articles,
      secondary_logo_link,
      secondary_logo_text,
      secondary_partner_logo
    } = super_article
    const isDisabled = !article.is_super_article

    return (
      <div className='AdminSuperArticle'>
        <Row>
          <Col xs={12}>
            <div
              className='field-group field-group--inline flat-checkbox'
              onClick={(e) => onChangeArticleAction('is_super_article', !article.is_super_article)}
              name='media.published'
            >
              <input
                type='checkbox'
                checked={article.is_super_article}
                readOnly
              />
              <label>Enable Super Article</label>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={4}>
            <div className='field-group'>
              <label>Partner Link Title</label>
              <input
                className='bordered-input'
                defaultValue={partner_link_title || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('partner_link_title', e.target.value)}
              />
            </div>

            <div className='field-group'>
              <label>Partner Link</label>
              <input
                className='bordered-input'
                defaultValue={partner_link || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('partner_link', e.target.value)}
              />
            </div>

            <div className='field-group'>
              <label>Partner Logo Link</label>
              <input
                className='bordered-input'
                defaultValue={partner_logo_link || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('partner_logo_link', e.target.value)}
              />
            </div>

            <div className='field-group'>
              <label>Secondary Logo Text</label>
              <input
                className='bordered-input'
                defaultValue={secondary_logo_text || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('secondary_logo_text', e.target.value)}
              />
            </div>
            <div className='field-group'>
              <label>Secondary Logo Link</label>
              <input
                className='bordered-input'
                defaultValue={secondary_logo_link || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('secondary_logo_link', e.target.value)}
              />
            </div>
            <div className='field-group'>
              <label>Footer Title</label>
              <input
                className='bordered-input'
                defaultValue={footer_title || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('footer_title', e.target.value)}
              />
            </div>
            <div className='field-group'>
              <label>Footer Blurb</label>
              <textarea
                className='bordered-input'
                defaultValue={footer_blurb || ''}
                disabled={isDisabled}
                onChange={(e) => this.onChange('footer_blurb', e.target.value)}
              />
              <div className='supports-markdown' />
            </div>
          </Col>

          <Col xs={4}>
            <div className='field-group'>
              <label>Partner Logo</label>
              <ImageUpload
                name='partner_logo'
                src={partner_logo || ''}
                onChange={this.onChange}
              />
            </div>

            <div className='field-group'>
              <label>Partner Fullscreen</label>
              <ImageUpload
                name='partner_fullscreen_header_logo'
                src={partner_fullscreen_header_logo || ''}
                onChange={this.onChange}
              />
            </div>

            <div className='field-group'>
              <label>Secondary Logo</label>
              <ImageUpload
                name='secondary_partner_logo'
                src={secondary_partner_logo || ''}
                onChange={this.onChange}
              />
            </div>
          </Col>
          <Col xs={4}>
            <Autocomplete
              items={related_articles || []}
              onSelect={(results) => this.onChange('related_articles', results)}
              placeholder='Search by title...'
              url={`${apiURL}/articles?published=true&q=%QUERY`}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  apiURL: state.app.apiURL
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminSuperArticle)
