import { debounce } from "lodash"
import React from "react"
import styled from "styled-components"

interface DragTargetProps {
  activeTarget?: number
  activeSource?: number
  children?: any
  dragStartY: number
  dropPosition?: "top" | "bottom"
  index: number
  isDraggable?: boolean
  isVertical?: boolean
  height?: number
  type?: string
  width?: number
  layout?: string
  setDragTarget: (index: number, target: any, mouseY: number) => void
}

export class DragTarget extends React.Component<DragTargetProps> {
  public debouncedDragTarget
  public target

  componentWillMount() {
    const { setDragTarget, index } = this.props

    this.debouncedDragTarget = debounce(($dragTarget, mouseY) => {
      $dragTarget = $(this.target)
      setDragTarget(index, $dragTarget, mouseY)
    }, 3)
  }

  setDragTarget = e => {
    const { index, activeTarget, dragStartY } = this.props
    if (index !== activeTarget) {
      const mouseY = e.clientY - dragStartY
      this.debouncedDragTarget(mouseY)
    }
  }

  renderDropZone = () => {
    const { isVertical, isDraggable, activeTarget, height } = this.props

    if (activeTarget && isDraggable) {
      return <DragPlaceholder isVertical={isVertical} height={height} />
    }
  }

  render() {
    const {
      activeSource,
      activeTarget,
      dropPosition,
      layout,
      type,
    } = this.props
    return (
      <DragTargetContainer
        innerRef={ref => (this.target = ref)}
        activeSource={activeSource}
        activeTarget={activeTarget}
        onDragOver={this.setDragTarget}
        layout={layout}
        type={type}
      >
        {dropPosition === "top" && this.renderDropZone()}
        {this.props.children}
        {dropPosition === "bottom" && this.renderDropZone()}
      </DragTargetContainer>
    )
  }
}

const DragPlaceholder = styled.div.attrs<{
  height?: number
  isVertical?: boolean
}>({})`
  border: 1px solid gray;
  height: ${props => (props.height ? props.height : "auto")};
`

const DragTargetContainer = styled.div.attrs<{
  activeSource?: number
  activeTarget?: number
  type?: string
  width?: number
  layout?: string
}>({})`
  height: ${props => (props.width ? props.width : "100%")};
`
