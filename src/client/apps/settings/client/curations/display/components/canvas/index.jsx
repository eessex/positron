import PropTypes from "prop-types"
import React from "react"
import { Col, Row } from "@artsy/palette"
import styled from "styled-components"
import { CanvasControls } from "./canvas_controls.jsx"
import { CanvasImages } from "./canvas_images.jsx"
import { CanvasText } from "./canvas_text.jsx"

export class Canvas extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeLayout: props.campaign.canvas.layout || "overlay",
    }
  }

  setActiveLayout = layout => {
    this.setState({ activeLayout: layout })
    this.props.onChange("canvas.layout", layout, this.props.index)
  }

  render() {
    const { campaign, index, onChange } = this.props
    return (
      <div className="display-admin--canvas">
        <div className="display-admin__section-title">Canvas</div>
        <CanvasControls
          activeLayout={this.state.activeLayout}
          setActiveLayout={this.setActiveLayout}
        />
        {this.state.activeLayout === "overlay" && (
          <CoverOverlayContainer>
            <input
              type="checkbox"
              defaultChecked={campaign.canvas.has_cover_overlay}
              onClick={e =>
                onChange("canvas.has_cover_overlay", e.target.checked, index)
              }
            />
            <label>Canvas Cover Overlay</label>
          </CoverOverlayContainer>
        )}
        <Row className="display-admin__section--canvas">
          <Col lg>
            <CanvasText campaign={campaign} index={index} onChange={onChange} />
          </Col>
          <Col lg>
            <CanvasImages
              key={index}
              campaign={campaign}
              index={index}
              onChange={onChange}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

Canvas.propTypes = {
  campaign: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

export const CoverOverlayContainer = styled.div`
  display: inline-block;
  label {
    display: inline;
    margin-left: 20px;
  }
`
