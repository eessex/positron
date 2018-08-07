import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import colors from '@artsy/reaction/dist/Assets/Colors'
import { RemoveButton, RemoveButtonContainer } from 'client/components/remove_button'

export class TextInputUrl extends Component {
  static propTypes = {
    confirmLink: PropTypes.func,
    onClickOff: PropTypes.func,
    pluginType: PropTypes.string,
    removeLink: PropTypes.func,
    selectionTarget: PropTypes.object,
    urlValue: PropTypes.string
  }

  state = {
    url: this.props.urlValue || ''
  }

  confirmLink = (e) => {
    e.preventDefault()
    const { url } = this.state
    const {
      confirmLink,
      pluginType,
      removeLink
    } = this.props

    if (url.length) {
      confirmLink(url, pluginType)
    } else {
      removeLink()
    }
  }

  render () {
    const { url } = this.state
    const { onClickOff, removeLink, selectionTarget } = this.props

    return (
      <div>
        <BackgroundOverlay onClick={onClickOff} />
        <TextInputUrlContainer
          className='TextInputUrl'
          top={selectionTarget && selectionTarget.top}
          left={selectionTarget && selectionTarget.left}
        >
          <InputContainer>
            <Input
              autoFocus
              className='bordered-input'
              value={url}
              onChange={(e) => this.setState({url: e.target.value})}
              placeholder='Paste or type a link'
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  this.confirmLink(e)
                }
              }}
            />
            {url.length > 0 &&
              <RemoveButton
                onMouseDown={removeLink}
                background={colors.grayMedium}
              />
            }
          </InputContainer>

          <Button
            className='add-link'
            onMouseDown={this.confirmLink}
          >
            Apply
          </Button>
        </TextInputUrlContainer>
      </div>
    )
  }
}

const TextInputUrlContainer = styled.div`
  top: ${props => `${props.top}px` || 0};
  left: ${props => `${props.left}px` || 0};
  position: absolute;
  background-color: black;
  height: 50px;
  width: 400px;
  padding: 10px;
  display: flex;
  z-index: 10;

  ${RemoveButtonContainer} {
    position: absolute;
    right: 10px;
    width: 20px;
    height: 20px;
    top: 5px;
  }
`

const Input = styled.input`
  background-color: white;
  width: 300px;
  max-width: 300px;
  height: 30px;
  font-size: 15px;
`

const InputContainer = styled.div`
  position: relative;
`

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const Button = styled.button`
  border: 0;
  padding: 0;
  width: 80px;
  height: 30px;
  text-align: center;
  transition: color .15s;

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid black;
    position: absolute;
    top: -7px;
    left: 50%;
  }
`
