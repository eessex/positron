import { mount } from 'enzyme'
import React from 'react'
import { Paragraph } from '../paragraph'

describe('Paragraph', () => {
  const getWrapper = props => {
    return mount(
      <Paragraph {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      onChange: jest.fn(),
      html: '<p>A piece of text</p>'
    }
  })

  // it('focuses on click', () => {
  //   const wrapper = mount(
  //     <PlainText {...props} />
  //   )
  //   const spy = jest.spyOn(wrapper.instance(), 'focus')
  //   wrapper.update()
  //   // FIXME TEST: Not sure why this has to be called twice
  //   wrapper.simulate('click')
  //   wrapper.simulate('click')
  //   expect(spy).toHaveBeenCalled()
  // })

  describe('#setEditorState', () => {
    describe('Create from empty', () => {
      it('Can initialize an empty state', () => {
        props.html = null
        props.placeholder = 'Write something...'
        const component = getWrapper(props)

        expect(component.text()).toBe('Write something...')
      })

      xit('Can initialize an empty state with decorators', () => {
        props.html = null
        props.linked = true
        const component = getWrapper(props)
        console.log(component.getElement())
      })
    })

    describe('Create with content', () => {
      it('Can initialize with existing content', () => {
        const component = getWrapper(props)
        expect(component.text()).toBe('A piece of text')
      })

      it('Can initialize existing content with decorators', () => {
        props.linked = true
        props.html = '<p>A <a href="https://artsy.net">piece</a> of text</p>'
        const component = getWrapper(props)

        expect(component.text()).toBe('A piece of text')
        expect(component.html()).toMatch('<a href="https://artsy.net/">')
      })
    })
  })

  describe('#editorStateFromHTML', () => {
    it('Removes disallowed blocks', () => {
      const html = '<a href="https://artsy.net">a link</a><h1>an h1</h1><h2>an h2</h2><h3>an h3</h3><h4>an h4</h4><h5>an h5</h5><h6>an h6</h6><ul><li>a list</li></ul>'
      const component = getWrapper(props)
      const editorState = component.instance().editorStateFromHTML(html)
      console.log(component.instance().editorStateToHtml(editorState))
      // component.simulate('click')
      // component.simulate('click')
      console.log(component.state())
    })
    it('Removes disallowed styles', () => {})
    it('Calls #stripGoogleStyles', () => {})
    it('Strips linebreaks if props.stripLinebreaks', () => {})
  })

  describe('#editorStateToHtml', () => {
    it('Removes disallowed blocks from existing content', () => {})
    it('Removes disallowed styles from existing content', () => {})
  })

  describe('#onChange', () => {
    it('Sets state with new editorState and html', () => {})
    it('Calls props.onChange if html is changed', () => {})
    it('Does not call props.onChange if html is unchanged', () => {})
  })

  describe('#handleKeyCommand', () => {
    it('Calls #promptForLink if link-prompt', () => {})
    it('Calls #keyCommandInlineStyle if bold', () => {})
    it('Calls #keyCommandInlineStyle if italic', () => {})
    it('Returns not-handled from anything else', () => {})
  })

  describe('#handleReturn', () => {
    it('Returns handled if props.stripLinebreaks', () => {})
    it('Calls #handleReturn if linebreaks are allowed', () => {})
  })

  describe('#keyCommandInlineStyle', () => {
    describe('Bold', () => {
      it('Applies bold styles if allowed', () => {})
      it('Does not apply bold styles if not allowed', () => {})
    })

    describe('Italic', () => {
      it('Applies italic styles if allowed', () => {})
      it('Does not apply italic styles if not allowed', () => {})
    })
  })

  describe('#toggleInlineStyle', () => {
    describe('Bold', () => {
      it('Applies bold styles if allowed', () => {})
      it('Does not apply bold styles if not allowed', () => {})
    })

    describe('Italic', () => {
      it('Applies italic styles if allowed', () => {})
      it('Does not apply italic styles if not allowed', () => {})
    })
  })

  describe('#onPaste', () => {
    it('Can paste plain text', () => {})
    it('Can paste html text', () => {})
    it('Removes disallowed blocks from pasted content', () => {})
    it('Removes disallowed styles from pasted content', () => {})
  })

  describe('#checkSelection', () => {
    describe('Has selection', () => {
      it('Sets selection target if has selection', () => {})
      it('Shows nav if has selection', () => {})
    })
    describe('No selection', () => {
      it('Removes selection target if no selection', () => {})
      it('Hides nav if no selection', () => {})
    })
  })

  describe('Links', () => {
    describe('#promptForLink', () => {
      it('Sets a selectionTarget', () => {})
      it('Sets urlValue with data', () => {})
      it('Sets urlValue without data', () => {})
      it('Hides nav', () => {})
      it('Shows url input', () => {})
    })

    describe('#confirmLink', () => {
      it('Sets selection target to null', () => {})
      it('Sets urlValue to empty string', () => {})
      it('Hides nav and url input', () => {})
      it('Adds a link to selected text', () => {})
    })

    describe('#removeLink', () => {
      it('Removes a link from selected entity', () => {})
      it('Hides url input', () => {})
      it('Sets urlValue to empty string', () => {})
    })
  })
})
