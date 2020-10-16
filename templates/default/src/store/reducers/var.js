import * as types from '../actionTypes'

export function isIOS(state = {}, action) {
  switch (action.type) {
    case types.SET_IS_IOS:
      return action.isIOS
    default:
      return state
  }
}
