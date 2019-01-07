import { Box, Flex } from "@artsy/palette"
import { clone, uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import request from "superagent"
import { difference, flatten, pluck } from "underscore"
import { onChangeArticle } from "../../../../../../actions/edit/articleActions"
import { AutocompleteList } from "../../../../../../components/autocomplete2/list"
import AutocompleteListMetaphysics from "../../../../../../components/autocomplete2/list_metaphysics"
import { AuthorsQuery } from "../../../../../../queries/authors"

export interface ArticleAuthorsProps {
  article: any
  apiURL: string
  isEditorial: boolean
  onChangeArticleAction: (key: string, value: any) => void
  user: any
}

export class ArticleAuthors extends Component<ArticleAuthorsProps> {
  onChangeAuthor = name => {
    const { article, onChangeArticleAction } = this.props
    const author = clone(article.author) || {}

    author.name = name
    onChangeArticleAction("author", author)
  }

  fetchAuthors = (fetchedItems, cb) => {
    const { apiURL, article, user } = this.props
    const { author_ids } = article

    const alreadyFetched = pluck(fetchedItems, "id")
    const idsToFetch = difference(author_ids, alreadyFetched)
    const newItems = clone(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${apiURL}/graphql`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: AuthorsQuery(idsToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          newItems.push(res.body.data.authors)
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  render() {
    const { article, apiURL, isEditorial, onChangeArticleAction } = this.props
    const name = article.author ? article.author.name : ""

    return (
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pb={40} pr={[0, 20]}>
          <label>Primary Author</label>
          <input
            className="bordered-input"
            defaultValue={name}
            onChange={e => this.onChangeAuthor(e.target.value)}
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 20]}>
          {isEditorial && (
            <Box pb={40}>
              <label>Authors</label>
              <AutocompleteList
                fetchItems={this.fetchAuthors}
                items={article.author_ids || []}
                filter={items => {
                  return items.results.map(item => {
                    const { id, image_url } = item
                    return {
                      id,
                      thumbnail_image: image_url,
                      name: item.name,
                    }
                  })
                }}
                onSelect={results =>
                  onChangeArticleAction("author_ids", results)
                }
                placeholder="Search by author name..."
                url={`${apiURL}/authors?q=%QUERY`}
              />
            </Box>
          )}
          {article.layout !== "news" && (
            <Box pb={40}>
              <AutocompleteListMetaphysics
                field="contributing_authors"
                label="Contributing Authors"
                model="users"
              />
            </Box>
          )}
        </Box>
      </Flex>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
  isEditorial: state.app.isEditorial,
  user: state.app.user,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArticleAuthors)
