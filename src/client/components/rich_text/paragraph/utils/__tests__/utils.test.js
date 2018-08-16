const Draft = require('draft-js')
import {
  keyBindingFn,
  styleMapFromNodes,
  styleNamesFromMap,
  styleNodesFromMap
} from '../utils'

describe('Paragraph utils', () => {
  describe('#styleMapFromNodes', () => {
    it('Converts an array of style nodeNames to styleMap', () => {
      const styleMap = styleMapFromNodes(['B'])

      expect(styleMap.length).toBe(1)
      expect(styleMap[0]).toEqual({ label: 'B', name: 'BOLD' })
    })

    it('Returns default styles if no args', () => {
      const styleMap = styleMapFromNodes()

      expect(styleMap[0]).toEqual({ label: 'B', name: 'BOLD' })
      expect(styleMap[1]).toEqual({ label: 'I', name: 'ITALIC' })
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

      expect(styleNames.length).toBe(2)
      expect(styleNames[0]).toBe('BOLD')
      expect(styleNames[1]).toBe('ITALIC')
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

      expect(styleNodes.length).toBe(2)
      expect(styleNodes[0]).toBe('B')
      expect(styleNodes[1]).toBe('I')
    })
  })

  describe('#keyBindingFn', () => {
    it('Can handle link-prompt', () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValueOnce(true)    
      const keybinding = keyBindingFn({keyCode: 75})

      expect(keybinding).toBe('link-prompt')
    })

    it('Returns default keybinding if not link-prompt', () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(false)
      Draft.getDefaultKeyBinding = jest.fn()
      keyBindingFn({ keyCode: 75 })

      expect(Draft.getDefaultKeyBinding).toBeCalled()
    })
  })

  describe('#handleReturn', () => {
    it('Returns not-handled if focus is in first block', () => {})
    it('Returns not-handled if focus has anchor offset', () => {})
    it('Returns handled and prevents default if creating an empty block', () => {})
  })

  describe('#insertPastedState', () => {
    it('Merges two states at selection', () => {})
  })
})
