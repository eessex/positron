import { data as sd } from 'sharify'

export const initialState = {
  channel: sd.CURRENT_CHANNEL,
  isAdmin: sd.USER.type === 'Admin',
  user: sd.USER,
  appURL: sd.APP_URL,
  artsyURL: sd.ARTSY_URL,
  forceURL: sd.FORCE_URL,
  apiURL: sd.API_URL,
  metaphysicsURL: sd.GRAPHQL_ENDPOINT
}

export function appReducer (state = initialState, action) {
  return state
}
