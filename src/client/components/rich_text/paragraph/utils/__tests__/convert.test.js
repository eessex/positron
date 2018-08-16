import { paragraphStyleMap } from '../utils'
import { convertHtmlToDraft } from '../convert'

describe('#convertHtmlToDraft', () => {
  const getContentState = (html, hasLinks = false) => {
    return convertHtmlToDraft(
      html,
      hasLinks,
      paragraphStyleMap
    )
  }

  describe('Links', () => {
    it('Converts links to entities if allowed', () => {
      const html = '<p><a href="https://artsy.net">a link</a></p>'
      const contentState = getContentState(html, true)
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()

      block.findEntityRanges(
        character => {
          const entityKey = character.getEntity()
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'LINK'
          )
        },
        hasLinks
      )

      expect(hasLinks).toBeCalled()
      expect(block.getType()).toBe('unstyled')
      expect(block.getText()).toBe('a link')
    })

    it('Returns links as plaintext if not allowed', () => {
      const html = '<p><a href="https://artsy.net">a link</a></p>'
      const contentState = getContentState(html)
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()

      block.findEntityRanges(
        character => {
          const entityKey = character.getEntity()
          return (
            entityKey !== null &&
            contentState.getEntity(entityKey).getType() === 'LINK'
          )
        },
        hasLinks
      )

      expect(hasLinks).not.toBeCalled()
      expect(block.getType()).toBe('unstyled')
      expect(block.getText()).toBe('a link')
    })
  })

  describe('Style handling', () => {
    it('Preserves italic styles', () => {
      const html = '<p><em>italic</em></p>'
      const contentState = getContentState(html)
      const block = contentState.getFirstBlock()
      const hasStyle = jest.fn()

      block.findStyleRanges(
        character => {
          return character.hasStyle('ITALIC')
        },
        hasStyle
      )
      expect(hasStyle).toBeCalled()
      expect(block.getType()).toBe('unstyled')
      expect(block.getText()).toBe('italic')
    })

    it('Preserves bold styles', () => {
      const html = '<p><strong>bold</strong></p>'
      const contentState = getContentState(html)
      const block = contentState.getFirstBlock()
      const hasStyle = jest.fn()

      block.findStyleRanges(
        character => {
          return character.hasStyle('BOLD')
        },
        hasStyle
      )
      expect(hasStyle).toBeCalled()
      expect(block.getType()).toBe('unstyled')
      expect(block.getText()).toBe('bold')
    })

    describe('Disallowed style handling', () => {
      it('Removes code styles', () => {
        const html = '<p><code>code</code></p>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()
        const hasStyle = jest.fn()

        block.findStyleRanges(
          character => {
            return character.hasStyle('CODE')
          },
          hasStyle
        )
        expect(hasStyle).not.toBeCalled()
        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('code')
      })

      it('Removes strikethrough styles', () => {
        const html = '<p><s>strikethrough</s></p>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()
        const hasStyle = jest.fn()

        block.findStyleRanges(
          character => {
            return character.hasStyle('STRIKETHROUGH')
          },
          hasStyle
        )
        expect(hasStyle).not.toBeCalled()
        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('strikethrough')
      })

      it('Removes underline styles', () => {
        const html = '<p><u>underline</u></p>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()
        const hasStyle = jest.fn()

        block.findStyleRanges(
          character => {
            return character.hasStyle('UNDERLINE')
          },
          hasStyle
        )
        expect(hasStyle).not.toBeCalled()
        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('underline')
      })
    })
  })

  describe('Block handling', () => {
    it('Returns unstyled paragraphs', () => {
      const html = '<p>a paragraph</p>'
      const contentState = getContentState(html)
      const block = contentState.getFirstBlock()

      expect(block.getType()).toBe('unstyled')
      expect(block.getText()).toBe('a paragraph')
    })

    describe('Disallowed blocks', () => {
      it('Converts h1 blocks', () => {
        const html = '<h1>an h1</h1>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('an h1')
      })

      it('Converts h2 blocks', () => {
        const html = '<h2>an h2</h2>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('an h2')
      })

      it('Converts h3 blocks', () => {
        const html = '<h3>an h3</h3>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('an h3')
      })

      it('Converts h4 blocks', () => {
        const html = '<h4>an h4</h4>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('an h4')
      })

      it('Converts h5 blocks', () => {
        const html = '<h5>an h5</h5>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('an h5')
      })

      it('Converts h6 blocks', () => {
        const html = '<h6>an h6</h6>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('an h6')
      })

      it('Converts ul blocks', () => {
        const html = `
          <ul>
          <li>first list item</li>
          <li>second list item</li>
          </ul>
        `
        const contentState = getContentState(html)
        const firstBlock = contentState.getFirstBlock()
        const secondBlock = contentState.getLastBlock()

        expect(firstBlock.getType()).toBe('unstyled')
        expect(firstBlock.getText()).toBe('first list item')
        expect(secondBlock.getType()).toBe('unstyled')
        expect(secondBlock.getText()).toBe('second list item')
      })

      it('Converts ol blocks', () => {
        const html = `
          <ol>
          <li>first list item</li>
          <li>second list item</li>
          </ol>
        `
        const contentState = getContentState(html)
        const firstBlock = contentState.getFirstBlock()
        const secondBlock = contentState.getLastBlock()

        expect(firstBlock.getType()).toBe('unstyled')
        expect(firstBlock.getText()).toBe('first list item')
        expect(secondBlock.getType()).toBe('unstyled')
        expect(secondBlock.getText()).toBe('second list item')
      })

      it('Converts div blocks', () => {
        const html = '<div>a div</div>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('a div')
      })

      it('Converts table blocks', () => {
        const html = '<tr><th>table header</th><td>table cell</td></tr>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('table headertable cell')
      })

      it('Removes body blocks', () => {
        const html = '<body><p>a nested paragraph</p></body>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('a nested paragraph')
      })

      it('Removes meta tags', () => {
        const html = '<meta><title>Page Title</title></meta><p>a paragraph</p>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('a paragraph')
      })

      it('Removes script tags', () => {
        const html = '<script>do a bad thing</script><p>a paragraph</p>'
        const contentState = getContentState(html)
        const block = contentState.getFirstBlock()

        expect(block.getType()).toBe('unstyled')
        expect(block.getText()).toBe('a paragraph')
      })
    })
  })
})
