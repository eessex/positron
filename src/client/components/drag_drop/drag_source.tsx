import React from "react"
import styled from "styled-components"

interface DragSourceProps {
  activeSource?: boolean
  children: any
  isDraggable?: boolean
  index: number
  onDragEnd: () => void
  setDragSource: (i: number, height: number, startY: number) => void
}

export class DragSource extends React.Component<DragSourceProps> {
  setDragSource = e => {
    const { isDraggable, index, setDragSource } = this.props
    const { clientY, currentTarget } = e

    if (isDraggable) {
      const dragStartY =
        clientY - ($(currentTarget).position().top - window.scrollY)
      const dragHeight = $(currentTarget).height()

      setDragSource(index, dragHeight, dragStartY)
    }
  }

  render() {
    const { activeSource, children, isDraggable, onDragEnd } = this.props

    return (
      <DragSourceContainer
        isActiveSource={activeSource}
        isDraggable={isDraggable}
        onDragEnd={onDragEnd}
        onDragStart={this.setDragSource}
      >
        {children}
      </DragSourceContainer>
    )
  }
}

const DragSourceContainer = styled.div.attrs<{
  isDraggable?: boolean
  isActiveSource?: boolean
}>({})``
