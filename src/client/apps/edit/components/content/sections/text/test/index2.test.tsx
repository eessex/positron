import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { RichText } from "client/components/draft/rich_text/rich_text"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { SectionText2 } from "../index2"

describe("SectionText", () => {
  let props
  let article

  const getWrapper = (passedProps = props) => {
    return mount(<SectionText2 {...passedProps} />)
  }

  beforeEach(() => {
    article = cloneDeep(StandardArticle)

    props = {
      article,
      divideEditorStateAction: jest.fn(),
      getAllowedBlocksAction: jest.fn(),
      index: 2,
      onChangeSectionAction: jest.fn(),
      onSetEditing: jest.fn(),
      removeSectionAction: jest.fn(),
      section: cloneDeep(article.sections[11]),
      sections: article.sections,
    }
  })

  it("Renders RichText component", () => {
    const component = getWrapper()
    expect(component.find(RichText).length).toBe(1)
  })

  xdescribe("#onHandleReturn", () => {
    // it("calls #onSplitTextSectionAction if section should be split", () => {})
    // it("does nothing if section should not be split", () => {})
  })

  xdescribe("#onHandleTab", () => {
    // it("calls #setSectionAction for next section", () => {})
    // it("calls #setSectionAction for last section if shift key", () => {})
    // it("calls #resetEditorState", () => {})
  })

  xdescribe("#onHandleBackspace", () => {
    // it("calls #maybeMergeTextSectionsAction if section is not first", () => {})
    // it("does nothing if section is first", () => {})
  })
})
