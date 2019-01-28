import { cloneDeep } from "lodash"
import React from "react"
import styled from "styled-components"
// import { DragSource } from "./drag_source"
// import { DragTarget } from "./drag_target"

interface DragDropListProps {
  children: any
  items: any[]
  dimensions: DragItemDimensions[]
  isVertical?: boolean
  isWrapping?: boolean
  onDragEnd: (items: any[]) => void
}

export type DropPosition = "top" | "bottom"

interface DragItemDimensions {
  width: number
}

interface DragDropListState {
  dragSource: number | null
  dragTarget: any
  dragStartY: any
  draggingHeight: number
  dropPosition: DropPosition
}

export class DragDropList extends React.Component<
  DragDropListProps,
  DragDropListState
> {
  state = {
    dragSource: null,
    dragTarget: null,
    dragStartY: null,
    draggingHeight: 0,
    dropPosition: "top" as DropPosition,
  }

  setDragSource = (index, draggingHeight, dragStartY) => {
    this.setState({
      dragSource: index,
      dragStartY,
      draggingHeight,
    })
  }

  setDragTarget = (index, $dragTarget, mouseY) => {
    const { dragSource } = this.state
    if (dragSource && dragSource === 0) {
      const dropPosition = this.setDropZonePosition($dragTarget, index, mouseY)

      this.setState({
        dragTarget: index,
        dropPosition,
      })
    }
  }

  setDropZonePosition = ($dragTarget, dragTargetId, mouseY) => {
    const { children, isVertical } = this.props
    const { dragSource } = this.state
    let dropZonePosition: DropPosition = "top"

    if (!isVertical) {
      return dropZonePosition
    }

    const dragTargetTop = $dragTarget.position().top + 20 - window.scrollY
    const dragTargetCenter = dragTargetTop + $dragTarget.height() / 2
    const mouseBelowCenter = mouseY > dragTargetCenter
    const dragTargetIsNext = dragSource && dragTargetId === dragSource + 1
    const dragTargetNotFirst = dragTargetId !== 0
    const dragSourceNotLast = dragSource !== children.length - 1
    const isBelow = dragTargetNotFirst && dragSourceNotLast && mouseBelowCenter

    if (isBelow || dragTargetIsNext) {
      dropZonePosition = "bottom"
    }
    return dropZonePosition
  }

  onDragEnd = () => {
    const { items, onDragEnd } = this.props
    const { dragSource, dragTarget } = this.state
    const newItems = cloneDeep(items)

    if (dragSource && dragTarget && dragSource !== dragTarget) {
      const movedItem = newItems.splice(dragSource, 1)
      newItems.splice(dragTarget, 0, movedItem[0])
      onDragEnd(newItems)

      this.setState({
        dragSource: null,
        dragTarget: null,
        dragStartY: null,
        draggingHeight: 0,
      })
    }
  }

  setTargetWidth = i => {
    const { dimensions, isWrapping } = this.props
    const itemDimensions = dimensions[i].width

    if (isWrapping) {
      return itemDimensions * 2
    } else {
      return itemDimensions
    }
  }

  render() {
    const { children } = this.props
    return (
      <DragContainer>
        {children.map((child, i) => {
          return <div key={i}>{child}</div>
        })}
      </DragContainer>
    )
  }
}

export const DragContainer = styled.div``

//   render: ->
//     children = React.Children.toArray(@props.children)

//     div { className: 'drag-container' },
//       children.map (child, i) =>
//         if child.props.isDraggable is false or !@props.isDraggable
//           child
//         else
//           type = child.props.section?.type or null
//           if child.type.displayName is 'SectionContainer'
//             layout = child.props.section?.layout or 'column_width'

//           DragTarget {
//             key: i + '-' + child.type.displayName + '-target'
//             i: child.props.index or i
//             setDragTarget: @setDragTarget
//             activeSource: @state.dragSource is i
//             activeTarget: @state.dragTarget is i
//             isDraggable: @props.isDraggable
//             width: @setTargetWidth(i)
//             height: if @props.layout is 'vertical' then @state.draggingHeight else null
//             vertical: if @props.layout is 'vertical' then true else false
//             dropPosition: @state.dropPosition
//             dragStartY: @state.dragStartY
//             type: type
//             layout: layout or null
//           },
//             React.createElement(
//               DragSource, {
//                 index: child.props.index or i
//                 key: i + child.type.displayName + '-source'
//                 setDragSource: @setDragSource
//                 activeSource: @state.dragSource is i
//                 activeTarget: @state.dragTarget is i
//                 onDragEnd: @onDragEnd
//                 isDraggable: @props.isDraggable
//               },
//                 child
//             )
