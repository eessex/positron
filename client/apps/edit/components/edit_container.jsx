import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  startEditingArticle,
  stopEditingArticle,
  updateArticle,
  toggleSpinner
} from 'client/actions/editActions'

import { ErrorBoundary } from 'client/components/error/error_boundary'
import EditAdmin from './admin'
import EditContent from './content'
import EditDisplay from './display'
import EditError from './error'
import EditHeader from './header'

import { MessageModal } from './message'

const INACTIVITY_TIMEOUT = 600 * 1000

export class EditContainer extends Component {
  static propTypes = {
    activeView: PropTypes.string,
    article: PropTypes.object,
    channel: PropTypes.object,
    error: PropTypes.object,
    isSaved: PropTypes.bool,
    startEditingArticleAction: PropTypes.func,
    stopEditingArticleAction: PropTypes.func,
    // updateArticleAction: PropTypes.func,
    user: PropTypes.object,
    currentSession: PropTypes.object,
    toggleSpinnerAction: PropTypes.func
  }

  constructor (props) {
    super(props)

    const session = props.currentSession
    const isCurrentUserEditing = props.user && session && props.user.id === session.user.id

    this.state = {
      lastUpdated: null,
      isOtherUserInSession: !!props.currentSession && !isCurrentUserEditing,
      inactivityPeriodEntered: false,
      shouldShowModal: true,
      sentStopEditingEvent: false
    }

    this.setupBeforeUnload()

    // props.article.sections.on(
    //   'change add remove reset',
    //   () => this.maybeSaveArticle()
    // )
  }

  componentDidMount () {
    const { article, channel, startEditingArticleAction, user } = this.props

    startEditingArticleAction({
      channel,
      user,
      article: article.id
    })

    this.resetInactivityCounter()
    this.props.toggleSpinnerAction(false)
    window.addEventListener('beforeunload', this.sendStopEditing)
  }

  componentWillUnmount () {
    this.sendStopEditing()
    window.removeEventListener('beforeunload', this.sendStopEditing)
    clearTimeout(this.inactivityTimer)
  }

  setupBeforeUnload = () => {
    const { article } = this.props

    if (article.published) {
      window.addEventListener('beforeunload', this.beforeUnload)
    }
  }

  beforeUnload = (e) => {
    const { isSaved } = this.props
    // Custom messages are deprecated in most browsers
    // and will show default browser message instead
    if ($.active > 0) {
      e.returnValue = 'Your article is not finished saving.'
    } else if (!isSaved) {
      e.returnValue = 'You have unsaved changes, do you wish to continue?'
    } else {
      e.returnValue = undefined
    }
  }

  // onChange = (key, value) => {
  //   const { article, channel, updateArticleAction } = this.props

  //   this.resetInactivityCounter()
  //   article.set(key, value)
  //   updateArticleAction({
  //     channel,
  //     article: article.id
  //   })
  // }

  resetInactivityCounter = () => {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer)
    }
    this.inactivityTimer = setTimeout(this.setInactivityPeriod, INACTIVITY_TIMEOUT)
  }

  setInactivityPeriod = () => {
    this.setState({
      inactivityPeriodEntered: true
    })
  }

  sendStopEditing = () => {
    if (this.state.sentStopEditingEvent) return

    const { article, channel, stopEditingArticleAction, user } = this.props
    stopEditingArticleAction({
      channel,
      article: article.id,
      user
    })

    this.setState({
      sentStopEditingEvent: true
    })
  }

  getActiveView = () => {
    const { activeView } = this.props

    switch (activeView) {
      case 'admin':
        return <EditAdmin />
      case 'content':
        return <EditContent />
      case 'display':
        return <EditDisplay />
    }
  }

  modalDidClose = () => {
    this.setState({
      shouldShowModal: false
    })
  }

  render () {
    const { error, currentSession } = this.props
    const { isOtherUserInSession, inactivityPeriodEntered, shouldShowModal } = this.state

    let modalType = isOtherUserInSession ? 'locked' : (inactivityPeriodEntered ? 'timeout' : '')

    return (
      <div className='EditContainer'>
        <ErrorBoundary>
          <EditHeader beforeUnload={this.beforeUnload} />
        </ErrorBoundary>

        <ErrorBoundary>
          {error && <EditError />}
          {this.getActiveView()}
        </ErrorBoundary>

        {shouldShowModal && modalType &&
          <MessageModal
            type={modalType}
            session={currentSession}
            onClose={this.modalDidClose}
            onTimerEnded={() => {
              document.location.assign('/')
            }}
          />}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  activeView: state.edit.activeView,
  article: state.edit.article,
  channel: state.app.channel,
  error: state.edit.error,
  lastUpdated: state.edit.lastUpdated,
  user: state.app.user,
  currentSession: state.edit.currentSession,
  isSaved: state.edit.isSaved
})

const mapDispatchToProps = {
  startEditingArticleAction: startEditingArticle,
  stopEditingArticleAction: stopEditingArticle,
  updateArticleAction: updateArticle,
  toggleSpinnerAction: toggleSpinner
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)
