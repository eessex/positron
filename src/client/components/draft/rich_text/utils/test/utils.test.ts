import { convertToHTML } from 'draft-convert'
import Draft from 'draft-js'
import {
  blockElementsFromMap,
  blockNamesFromMap,
  handleReturn,
  insertPastedState,
  keyBindingFn,
  richTextBlockRenderMap, // TODO: maybe remove
  styleMapFromNodes,
  styleNamesFromMap,
  styleNodesFromMap,
} from '../utils'
const SelectionUtils = require('../../../../rich_text/utils/text_selection')

jest.mock('../../../../rich_text/utils/text_selection')

describe('RichText utils', () => {
  const e: React.KeyboardEvent<{}> = {} as React.KeyboardEvent<{}>

  describe('#styleMapFromNodes', () => {
    it('Converts an array of style nodeNames to styleMap', () => {
      const styleMap = styleMapFromNodes(['B'])

      expect(styleMap.length).toBe(1)
      expect(styleMap[0]).toEqual({ element: 'B', name: 'BOLD' })
    })

    it('Returns default styles if no args', () => {
      const styleMap = styleMapFromNodes()

      expect(styleMap[0]).toEqual({ element: 'B', name: 'BOLD' })
      expect(styleMap[1]).toEqual({ element: 'I', name: 'ITALIC' })
      expect(styleMap[2]).toEqual({ element: 'U', name: 'UNDERLINE' })
      expect(styleMap[3]).toEqual({ element: 'S', name: 'STRIKETHROUGH' })
    })
  })

  describe('#blockNamesFromMap', () => {
    // it('Converts a blockRenderMap to an array of block names', () => {
    //   const blocks = blockNamesFromMap(richTextBlockRenderMap)
    // })

    it('Returns default blocks if no args', () => {
      const blocks = blockNamesFromMap(richTextBlockRenderMap)

      expect(blocks.length).toBe(6)
      expect(blocks[0]).toBe('header-two')
      expect(blocks[1]).toBe('header-three')
      expect(blocks[2]).toBe('blockquote')
      expect(blocks[3]).toBe('unordered-list-item')
      expect(blocks[4]).toBe('ordered-list-item')
      expect(blocks[5]).toBe('unstyled')
    })
  })

  describe('#blockElementsFromMap', () => {
    // it('Converts a blockRenderMap to an array of elements', () => {
    //   const blocks = blockNamesFromMap(richTextBlockRenderMap)
    // })

    it('Returns default elements if no args', () => {
      const blocks = blockElementsFromMap(richTextBlockRenderMap)

      expect(blocks.length).toBe(5)
      expect(blocks[0]).toBe('h2')
      expect(blocks[1]).toBe('h3')
      expect(blocks[2]).toBe('blockquote')
      expect(blocks[3]).toBe('li')
      expect(blocks[4]).toBe('div')
    })
  })

  describe('#styleNamesFromMap', () => {
    it('Converts an array of style nodeNames', () => {
      const styleMap = styleMapFromNodes(['B'])
      const styleNames = styleNamesFromMap(styleMap)

      expect(styleNames.length).toBe(1)
      expect(styleNames[0]).toBe('BOLD')
    })

    it('Returns default styles if no args', () => {
      const styleMap = styleMapFromNodes()
      const styleNames = styleNamesFromMap(styleMap)

      expect(styleNames.length).toBe(4)
      expect(styleNames[0]).toBe('BOLD')
      expect(styleNames[1]).toBe('ITALIC')
      expect(styleNames[2]).toBe('UNDERLINE')
      expect(styleNames[3]).toBe('STRIKETHROUGH')
    })
  })

  describe('#styleNodesFromMap', () => {
    it('Converts an array of styles names', () => {
      const styleMap = styleMapFromNodes(['B'])
      const styleNodes = styleNodesFromMap(styleMap)

      expect(styleNodes.length).toBe(1)
      expect(styleNodes[0]).toBe('B')
    })

    it('Returns default styles if no args', () => {
      const styleMap = styleMapFromNodes()
      const styleNodes = styleNodesFromMap(styleMap)

      expect(styleNodes.length).toBe(4)
      expect(styleNodes[0]).toBe('B')
      expect(styleNodes[1]).toBe('I')
      expect(styleNodes[2]).toBe('U')
      expect(styleNodes[3]).toBe('S')
    })
  })

  describe('#keyBindingFn', () => {
    beforeEach(() => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(true)
    })

    it('Can handle header-one', () => {
      e.key = '1'
      e.keyCode = 49
      expect(keyBindingFn(e)).toBe('header-one')
    })

    it('Can handle header-two', () => {
      e.key = '2'
      e.keyCode = 50
      expect(keyBindingFn(e)).toBe('header-two')
    })

    it('Can handle header-three', () => {
      e.key = '3'
      e.keyCode = 51
      expect(keyBindingFn(e)).toBe('header-three')
    })

    it('Can handle plain-text', () => {
      e.key = '/'
      e.keyCode = 191
      expect(keyBindingFn(e)).toBe('plain-text')
    })

    it('Can handle ordered-list-item', () => {
      e.key = '7'
      e.keyCode = 55
      expect(keyBindingFn(e)).toBe('ordered-list-item')
    })

    it('Can handle unordered-list-item', () => {
      e.key = '8'
      e.keyCode = 56
      expect(keyBindingFn(e)).toBe('unordered-list-item')
    })

    it('Can handle link-prompt', () => {
      e.key = 'K'
      e.keyCode = 75
      expect(keyBindingFn(e)).toBe('link-prompt')
    })

    it('Can handle blockquote', () => {
      e.key = '['
      e.keyCode = 219
      expect(keyBindingFn(e)).toBe('blockquote')
    })

    it('Can handle strikethrough', () => {
      e.key = 'x'
      e.keyCode = 88
      e.shiftKey = true
      expect(keyBindingFn(e)).toBe('strikethrough')
    })

    it('Returns default keybinding if not supported key command', () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(false)
      Draft.getDefaultKeyBinding = jest.fn()
      keyBindingFn(e)

      expect(Draft.getDefaultKeyBinding).toBeCalled()
    })
  })

  describe('#handleReturn', () => {
    let editorState
    beforeEach(() => {
      e.key = 'Enter'
      editorState = Draft.EditorState.createEmpty()
      e.preventDefault = jest.fn()
    })

    it('Returns not-handled if focus is in first block', () => {
      SelectionUtils.getSelectionDetails.mockReturnValueOnce({
        isFirstBlock: true,
      })
      const returnHandler = handleReturn(e, editorState)

      expect(returnHandler).toBe('not-handled')
      expect(e.preventDefault).not.toBeCalled()
    })

    it('Returns not-handled if focus has anchor offset', () => {
      SelectionUtils.getSelectionDetails.mockReturnValueOnce({
        anchorOffset: 2,
      })
      const returnHandler = handleReturn(e, editorState)

      expect(returnHandler).toBe('not-handled')
      expect(e.preventDefault).not.toBeCalled()
    })

    it('Returns handled and prevents default if creating an empty block', () => {
      SelectionUtils.getSelectionDetails.mockReturnValueOnce({
        anchorOffset: 0,
      })
      const returnHandler = handleReturn(e, editorState)

      expect(returnHandler).toBe('handled')
      expect(e.preventDefault).toBeCalled()
    })
  })

  describe('#insertPastedState', () => {
    const getEditorState = html => {
      const blocks = Draft.convertFromHTML(html)
      const content = Draft.ContentState.createFromBlockArray(
        blocks.contentBlocks,
        blocks.entityMap
      )

      return Draft.EditorState.createWithContent(content)
    }

    it('Merges two states at selection', () => {
      const originalState = getEditorState('<p>Original block</p>')
      const pastedState = getEditorState('<p>Pasted block</p>')
      const newState = insertPastedState(pastedState, originalState)
      const newHtml = convertToHTML({})(newState.getCurrentContent())

      expect(newHtml).toBe('<p>Pasted blockOriginal block</p>')
    })
  })
})
