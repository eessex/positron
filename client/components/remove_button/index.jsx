import PropTypes from 'prop-types'
import React from 'react'
import { IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'

export const RemoveButton = (props) => {
  const {
    background,
    className,
    color,
    onClick
  } = props

  return (
    <div
      className={`RemoveButton ${className || ''}`}
      onClick={onClick}
    >
      <IconRemove
        color={color}
        background={background}
      />
    </div>
  )
}

RemoveButton.propTypes = {
  background: PropTypes.string,
  className: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func.isRequired
}