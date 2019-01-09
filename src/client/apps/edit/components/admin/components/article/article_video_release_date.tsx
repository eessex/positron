import { Box, Button, Flex, Sans } from "@artsy/palette"
import { SansLabelProps } from "client/apps/edit/components/admin/components/article/index"
import { clone } from "lodash"
import moment from "moment"
import React, { Component } from "react"
import { ArticleData } from "reaction/Components/Publishing/Typings"
import styled from "styled-components"

interface ArticleReleaseDateProps {
  article: ArticleData
  onChangeArticleAction: any
}

interface ArticleReleaseDateState {
  hasChanged: boolean
  releaseDate?: string
}

export class ArticleVideoReleaseDate extends Component<
  ArticleReleaseDateProps,
  ArticleReleaseDateState
> {
  constructor(props) {
    super(props)

    const { article } = props

    this.state = {
      hasChanged: false,
      releaseDate:
        article && article.media
          ? moment(article.media.release_date).toISOString()
          : undefined,
    }
  }

  onMediaChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const media = clone(article.media) || {}

    media[key] = value
    onChangeArticleAction("media", media)
  }

  onMediaReleaseChange = () => {
    this.setState({ hasChanged: false }, () => {
      this.onMediaChange("release_date", this.state.releaseDate)
    })
  }

  onDateChange = event => {
    const date = moment(event.target.value).toISOString()

    this.setState({ hasChanged: true, releaseDate: date })
  }

  render() {
    const { hasChanged, releaseDate } = this.state

    return (
      <Box pb={40}>
        <Sans {...SansLabelProps}>Video Release Date</Sans>

        <Flex mt={1}>
          <Input
            type="date"
            className="bordered-input"
            defaultValue={moment(releaseDate).format("YYYY-MM-DD")}
            onChange={this.onDateChange}
          />

          <Button
            borderRadius={0}
            disabled={!hasChanged}
            onClick={this.onMediaReleaseChange}
            width="100%"
            height="auto"
          >
            Update
          </Button>
        </Flex>
      </Box>
    )
  }
}

const Input = styled.input`
  min-width: 70%;
  margin-right: 20px;
  margin-top: 0 !important;
`
