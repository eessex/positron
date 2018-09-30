import { ContentBlock, ContentState } from "draft-js"

/**
 * Inline style html elements
 */
export type StyleElementsFull = "B" | "I" | "S" | "U"
export type StyleElementsParagraph = "B" | "I"

/**
 * Inline style property names
 */
export type StyleNamesFull = "BOLD" | "ITALIC" | "STRIKETHROUGH" | "UNDERLINE"
export type StyleNamesParagraph = "BOLD" | "ITALIC"

/**
 * Assosciates a style name and html element
 */
export interface StyleMapStyle {
  element: StyleElementsFull | StyleElementsParagraph
  name: StyleNamesFull | StyleNamesParagraph
}

export type StyleMap = StyleMapStyle[]

export type StyleMapNames = StyleNamesFull[]

export type AllowedStylesParagraph = StyleElementsParagraph[]

export interface DecoratorType {
  strategy: (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => void
  component: any
  props?: object
}

export type Decorator = DecoratorType[]
