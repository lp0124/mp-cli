import {
  setIsIOS,
} from './actions/var'
import { isIOS } from '@/helpers/system'

export function getBasicInfo() {
  return dispatch => {
    dispatch(setIsIOS(isIOS()))
  }
}
