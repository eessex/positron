import Draft from "draft-js"
import { keyBindingFn } from "../utils"

describe("Paragraph utils", () => {
  const e: React.KeyboardEvent<{}> = {} as React.KeyboardEvent<{}>

  describe("#keyBindingFn", () => {
    beforeEach(() => {
      e.key = "K"
      e.keyCode = 75
    })

    it("Can handle link-prompt", () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest
        .fn()
        .mockReturnValueOnce(true)
      const keybinding = keyBindingFn(e)

      expect(keybinding).toBe("link-prompt")
    })

    it("Returns default keybinding if not link-prompt", () => {
      Draft.KeyBindingUtil.hasCommandModifier = jest.fn().mockReturnValue(false)
      Draft.getDefaultKeyBinding = jest.fn()
      keyBindingFn(e)

      expect(Draft.getDefaultKeyBinding).toBeCalled()
    })
  })
})
