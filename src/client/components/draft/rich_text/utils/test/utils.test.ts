import Draft from "draft-js"
import { keyBindingFn } from "../utils"

describe("RichText utils", () => {
  const e: React.KeyboardEvent<{}> = {} as React.KeyboardEvent<{}>

  describe("#keyBindingFn", () => {
    beforeEach(() => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(true)
    })

    it("Can handle header-one", () => {
      e.key = "1"
      e.keyCode = 49
      expect(keyBindingFn(e)).toBe("header-one")
    })

    it("Can handle header-two", () => {
      e.key = "2"
      e.keyCode = 50
      expect(keyBindingFn(e)).toBe("header-two")
    })

    it("Can handle header-three", () => {
      e.key = "3"
      e.keyCode = 51
      expect(keyBindingFn(e)).toBe("header-three")
    })

    it("Can handle plain-text", () => {
      e.key = "/"
      e.keyCode = 191
      expect(keyBindingFn(e)).toBe("plain-text")
    })

    it("Can handle ordered-list-item", () => {
      e.key = "7"
      e.keyCode = 55
      expect(keyBindingFn(e)).toBe("ordered-list-item")
    })

    it("Can handle unordered-list-item", () => {
      e.key = "8"
      e.keyCode = 56
      expect(keyBindingFn(e)).toBe("unordered-list-item")
    })

    it("Can handle link-prompt", () => {
      e.key = "K"
      e.keyCode = 75
      expect(keyBindingFn(e)).toBe("link-prompt")
    })

    it("Can handle blockquote", () => {
      e.key = "["
      e.keyCode = 219
      expect(keyBindingFn(e)).toBe("blockquote")
    })

    it("Can handle strikethrough", () => {
      e.key = "x"
      e.keyCode = 88
      e.shiftKey = true
      expect(keyBindingFn(e)).toBe("strikethrough")
    })

    it("Returns default keybinding if not supported key command", () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(false)
      Draft.getDefaultKeyBinding = jest.fn()
      keyBindingFn(e)

      expect(Draft.getDefaultKeyBinding).toBeCalled()
    })
  })
})
