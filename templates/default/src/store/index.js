/* eslint-disable no-console */
import { applyMiddleware, createStore } from '@/libs/redux'
import rootReducer from './reducers/index'
import { isFunction } from '@/helpers/types'

// 打印日志中间件
// eslint-disable-next-line no-unused-vars
function logger({ getState }) {
  return next => action => {
    console.log('state before dispatch', getState())
    const result = next(action)
    console.log('state after dispatch', getState())
    return result
  }
}

// redux-thunk中间件
function thunk({ dispatch, getState }) {
  return next => action => {
    if (isFunction(action)) {
      return action(dispatch, getState)
    }
    return next(action)
  }
}

const createStoreWithMiddleware = applyMiddleware(/* logger, */ thunk)(createStore)

const store = createStoreWithMiddleware(rootReducer)

export default store
