import { ContentBlock, ContentState } from 'draft-js'

export type BlockElement = 'h1' | 'h2' | 'h3' | 'blockquote' | 'ul' | 'ol' | 'p'

export type BlockName =
  | 'header-one'
  | 'header-two'
  | 'header-three'
  | 'blockquote'
  | 'unordered-list-item'
  | 'ordered-list-item'
  | 'unstyled'

export type AllowedBlocks = BlockElement[]

export type StyleNode = 'B' | 'I' | 'U' | 'S'

export type StyleName = 'BOLD' | 'ITALIC' | 'UNDERLINE' | 'STRIKETHROUGH'

export interface StyleMapStyle {
  label: StyleNode
  name: StyleName
}

export type StyleMap = StyleMapStyle[]

export type StyleMapNames = StyleName[]

export type AllowedStyles = StyleNode[]

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
