import storage from './storage'
import { numCalc } from './util'
import { reportPerformance } from './performanceReport'
import { isUndefined } from './types'

const REQUEST_URL = {
  dev: 'https://webapi.zmcms.cn',
  test: 'https://webapi.qimai.shop',
  beta: 'https://webapi.qmai.co',
  master: 'https://webapi.qmai.cn',
}
const EXT_CONFIG = wx.getExtConfigSync() || {}
const BASE_URL = REQUEST_URL[EXT_CONFIG.env || 'master']

function _mergeHeaders(options) {
  const headers = {
    Accept: 'v=1.0',
    'Qm-From-Type': 'plus',
    'Qm-From': '/* @if weixin */wechat/* @endif *//* @if alipay */alipay/* @endif */',
    'content-type': 'application/json',
    'Qm-User-Token': storage.get('token'),
    // @if alipay
    referer: BASE_URL,
    // @endif
    'request-source': 'reta',
    is_share: 1,
  }
  if (options.headers) {
    Object.assign(headers, options.headers)
  }
  return headers
}

function _dispatchParams(params, options = {}) {
  if (!options.not_common_params) {
    if (!params.store_id) {
      params.store_id = storage.get('store_id') || ''
    }
    if (!params.shop_id && params.shop_id !== 0) {
      params.shop_id = storage.get('shop_id') || 0
    }
  }
  if (!params.appid) {
    params.appid = EXT_CONFIG.appid || ''
  }
}

function _dispatchOptions(options) {
  options.retry_num = isUndefined(options.retry_num) ? 1 : options.retry_num
}

function _dispatchUrl(url) {
  return `${BASE_URL}/web${url}`
}

function _handleErrorCode(code) {

}

function _retry(r, options, fn) {
  if (options.retry_num < 1) {
    fn()
  } else {
    options.retry_num--
    r()
  }
}

function _request(method, url, params = {}, options = {}) {
  const header = _mergeHeaders(options)

  _dispatchParams(params, options)
  _dispatchOptions(options)

  return new Promise((resolve, reject) => {
    const r = () => {
      const startTime = new Date().getTime()
      let curr
      // @if weixin
      curr = wx
      // @endif
      // @if alipay
      curr = my
      // @endif
      curr.request({
        url: _dispatchUrl(url, options),
        method,
        // @if weixin
        header,
        // @endif
        // @if alipay
        headers: header,
        timeout: 6000,
        // @endif
        data: params,
        dataType: 'json',
        success: res => {
          if (res.data.status) {
            resolve(res.data)
          } else {
            const error = {
              code: res.data.code,
              statusCode: 200,
              errMsg: res.data.message,
              data: res.data.data,
            }
            reject(error)
            _handleErrorCode(res.data.code)
          }
        },
        fail: err => {
          _retry(r, options, () => {
            const error = {
              code: err.code,
              statusCode: 500,
              errMsg: err.errMsg,
            }
            reject(error)
          })
        },
        complete: () => {
          const endTime = new Date().getTime()
          reportPerformance(url, numCalc('-', endTime - startTime))
        },
      })
    }
    r()
  })
}

export default {
  get() {
    return _request('GET', ...arguments)
  },
  post() {
    return _request('POST', ...arguments)
  },
  delete(url, params = {}, options) {
    params._method = 'delete'
    return _request('POST', url, params, options)
  },
}
