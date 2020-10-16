import { combineReducers } from '@/libs/redux'
import { isIOS } from './var'

const rootReducer = combineReducers({
  isIOS,
})

export default rootReducer
