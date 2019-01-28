import React from "react"

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
      <div
        className="DragSource"
        data-source={activeSource}
        draggable={isDraggable}
        onDragEnd={onDragEnd}
        onDragStart={this.setDragSource}
      >
        {children}
      </div>
    )
  }
}
