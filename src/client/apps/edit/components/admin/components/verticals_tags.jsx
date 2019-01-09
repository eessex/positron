import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import { filter, map } from "lodash"
import Verticals from "../../../../../collections/verticals.coffee"
import { AutocompleteInlineList } from "/client/components/autocomplete2/inline_list"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { Flex, Box, Button, Sans } from "@artsy/palette"
import { SansLabelProps } from "client/apps/edit/components/admin/components/article/index"
import styled from "styled-components"

export class AdminVerticalsTags extends Component {
  static propTypes = {
    apiURL: PropTypes.string,
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func,
  }

  state = {
    vertical: this.props.article.vertical || null,
    verticals: [],
  }

  componentWillMount = () => {
    this.fetchVerticals()
  }

  fetchVerticals = () => {
    new Verticals().fetch({
      cache: true,
      success: res => {
        const verticals = map(res.sortBy("name"), "attributes")
        this.maybeSetupNews(verticals)
        this.setState({ verticals })
      },
    })
  }

  maybeSetupNews = verticals => {
    const { article, onChangeArticleAction } = this.props

    if (article.layout === "news" && !article.vertical) {
      const vertical = filter(verticals, ["name", "News"])[0]
      onChangeArticleAction("vertical", vertical)
    }
  }

  renderVerticalsList = () => {
    const { verticals } = this.state
    const { article, onChangeArticleAction } = this.props
    const name = article.vertical && article.vertical.name

    return verticals.map((item, index) => {
      const isActive = name && item.name === name

      return (
        <Button
          key={index}
          variant={isActive ? "primaryBlack" : "secondaryOutline"}
          onClick={() => {
            const vertical = isActive ? null : item
            onChangeArticleAction("vertical", vertical)
          }}
          mr={1}
          mt={1}
        >
          {item.name}
        </Button>
      )
    })
  }

  render() {
    const { apiURL, article, onChangeArticleAction } = this.props

    return (
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 20]} pb={40}>
          <Sans {...SansLabelProps}>Editorial Vertical</Sans>
          <VerticalsList mt={0.5}>{this.renderVerticalsList()}</VerticalsList>
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 20]} pb={40}>
          <Box pb={40}>
            <Sans {...SansLabelProps}>Topic Tags</Sans>
            <AutocompleteInlineList
              items={article.tags}
              filter={tags => {
                return tags.results.map(tag => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={tag => tag.name}
              onSelect={tags => onChangeArticleAction("tags", tags)}
              placeholder="Start typing a topic tag..."
              url={`${apiURL}/tags?public=true&q=%QUERY`}
            />
          </Box>

          <Box>
            <Sans {...SansLabelProps}>Tracking Tags</Sans>
            <AutocompleteInlineList
              items={article.tracking_tags}
              filter={tags => {
                return tags.results.map(tag => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={tag => tag.name}
              onSelect={tags => onChangeArticleAction("tracking_tags", tags)}
              placeholder="Start typing a tracking tag..."
              url={`${apiURL}/tags?public=false&q=%QUERY`}
            />
          </Box>
        </Box>
      </Flex>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminVerticalsTags)

const VerticalsList = styled(Box)`
  button {
    outline: none;
  }
`
