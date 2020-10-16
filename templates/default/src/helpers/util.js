import dayjs from '@/libs/day'
import prompt from './prompt'
import { isPlainObject, isUndefined, isString, isNumber, isFunction } from './types'
import { getLocation } from './location'

// 拼接对象为请求字符串
export function concatParamsObj(obj) {
  if (!isPlainObject(obj)) return ''

  const query = Object.keys(obj).reduce((acc, key) => {
    const value = obj[key]
    if (!isUndefined(value)) {
      // 值为 undefined 的不处理
      acc.push(`${key}=${encodeURIComponent(decodeURIComponent(value))}`)
    }
    return acc
  }, [])

  return query.length > 0 ? `?${query.join('&')}` : ''
}

export function sort(arr, key) {
  arr.sort((a, b) => {
    if (key) {
      return a[key] - b[key]
    }
    return a - b
  })
}

/**
 * 延迟执行
 * @param {Number} timeout - 延迟毫秒数
 * @returns {Promise}
 */
export function delay(timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}

/**
 * api兼容处理
 * @param {String} api
 * @returns {Function}
 */
export function compatible(api) {
  return api || (() => Promise.resolve())
}

/**
 * 获取当前页面路径
 * @returns {String}
 */
export function getCurrentPagePath() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return `/${currentPage.route || currentPage.__route__ || currentPage.is}`
}

export function getCurrentPageFullPath() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return `/${currentPage.route || currentPage.__route__ || currentPage.is}${concatParamsObj(
    currentPage.options
  )}`
}

// 获取扫码url后的code值
export function getScanCode(url = '') {
  url = decodeURIComponent(url) // 解析地址

  const i = url.indexOf('?')
  let params = ''
  // 获取url参数
  if (i !== -1) {
    params = url.slice(i + 1)
    params = params.split('&')

    const obj = {}

    params.forEach(v => {
      const arr = v.split('=')
      if (arr.length && arr.length === 2) obj[arr[0]] = arr[1]
    })
    params = obj
    url = url.slice(0, i)
  }

  const r = url.split('/')
  return {
    code: r[r.length - 1],
    params,
  }
}

/**
 * 将输入值转换成在范围之内的合法价格
 * @param {String|Number} input - 输入值
 * @param {Number} [max=999999.99] - 最大值，默认为 999999.99
 * @returns - 整理后的价格
 */
export function handlePriceInput(input, max = 999999.99) {
  input = String(input)
  if (input === '.') return '0.'
  let price = ''
  let [integer, decimal] = input.split('.')
  if (integer) {
    integer = Number(integer)
    if (Number.isNaN(integer)) integer = 0
    if (isString(decimal)) {
      if (decimal.length > 2) decimal = decimal.slice(0, 2)
      price = `${integer}.${decimal}`
    } else {
      price = String(integer)
    }
    if (max > 0 && parseFloat(price) > max) {
      price = parseFloat(max).toFixed(2)
    }
  }
  return price
}

// 金额保留两位小数，不四舍五入
export function sumToFixed(num, decimal = 2) {
  const calc = Number(num)
  if (!isNumber(calc)) {
    return decimal > 0 ? `0.${Array.from({ length: decimal }, () => 0).join('')}` : '0'
  }
  const [before, after] = String(calc).split('.')
  return decimal > 0
    ? `${before}.${Array.from({ length: decimal }, (_, i) => (after ? after[i] || 0 : 0)).join('')}`
    : before
}

/**
 * 数字运算，处理精度问题
 */
function calcDecCount(num) {
  const numStr = String(num)
  const pointIdx = numStr.indexOf('.')

  return pointIdx < 0 ? 0 : numStr.length - 1 - pointIdx
}
function movePoint(num, count) {
  const numArr = String(num).split('')
  const hasSign = num < 0
  if (hasSign) {
    numArr.shift()
  }

  let pointIdx = numArr.indexOf('.')
  if (pointIdx < 0) {
    pointIdx = numArr.length
  } else {
    numArr.splice(pointIdx, 1)
  }

  const padZero = Array.from({ length: Math.abs(count) }, () => 0)
  if (count >= 0) {
    numArr.push(...padZero)
  } else {
    numArr.unshift(...padZero)
    pointIdx -= count
  }

  pointIdx += count
  numArr.splice(pointIdx, 0, '.')
  const result = Number(numArr.join(''))

  return hasSign ? -result : result
}
export function numCalc(type, a, b) {
  a = Number(a || 0)
  b = Number(b || 0)
  const aDecCount = calcDecCount(a)
  const bDecCount = calcDecCount(b)

  if (type === '+') {
    const moveCount = Math.max(aDecCount, bDecCount)
    const result = movePoint(a, moveCount) + movePoint(b, moveCount)

    return movePoint(result, -moveCount)
  }
  if (type === '-') {
    const moveCount = Math.max(aDecCount, bDecCount)
    const result = movePoint(a, moveCount) - movePoint(b, moveCount)

    return movePoint(result, -moveCount)
  }
  if (type === '*') {
    const moveCount = aDecCount + bDecCount
    const result = movePoint(a, aDecCount) * movePoint(b, bDecCount)

    return movePoint(result, -moveCount)
  }
  if (type === '/') {
    const moveCount = Math.max(aDecCount, bDecCount)
    const result = movePoint(a, moveCount) / movePoint(b, moveCount)

    return result
  }

  throw new Error('参数错误')
}

// 判断是否手机号
export function isMobile(str) {
  return /^1[3|4|5|6|7|8|9]\d{9}$/.test(str)
}

// 强制小程序更新
export function compelUpdateApp() {
  try {
    let updateManager
    // @if weixin
    updateManager = wx.getUpdateManager()
    // @endif
    // @if alipay
    updateManager = my.getUpdateManager()
    // @endif
    if (updateManager) {
      updateManager.onUpdateReady(() => {
        prompt.alert('更新提示', '新版本已经准备好，请重启应用！').then(() => {
          updateManager.applyUpdate()
        })
      })
    }
  } catch (e) {
    // do nothing
  }
}

// 基础版本号比较
export function compareVersion(v1 = '', v2 = '') {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return true
    }
    if (num1 < num2) {
      return false
    }
  }

  return true
}

// 获取对应授权是否获得
export function getAuthSetting(name) {
  return new Promise((resolve, reject) => {
    // @if weixin
    wx.getSetting({
      success(res) {
        resolve(!!res.authSetting[`scope.${name}`])
      },
      fail: reject,
    })
    // @endif
    // @if alipay
    my.getSetting({
      success(res) {
        resolve(!!res.authSetting[`scope.${name}`])
      },
      fail: reject,
    })
    // @endif
  })
}

// 计算两点间的距离
export function calcPointDistance(lat1, lng1, lat2, lng2) {
  lat1 = Number(lat1)
  lng1 = Number(lng1)
  lat2 = Number(lat2)
  lng2 = Number(lng2)

  const EARTH_RADIUS = 6378137.0
  const getRad = d => (d * Math.PI) / 180.0
  const f = getRad((lat1 + lat2) / 2)
  const g = getRad((lat1 - lat2) / 2)
  const l = getRad((lng1 - lng2) / 2)
  let sg = Math.sin(g)
  let sl = Math.sin(l)
  let sf = Math.sin(f)
  const a = EARTH_RADIUS
  const fl = 1 / 298.257
  sg *= sg
  sl *= sl
  sf *= sf
  const s = sg * (1 - sl) + (1 - sf) * sl
  const c = (1 - sg) * (1 - sl) + sf * sl
  const w = Math.atan(Math.sqrt(s / c))
  const r = Math.sqrt(s * c) / w
  const d = 2 * w * a
  const h1 = (3 * r - 1) / 2 / c
  const h2 = (3 * r + 1) / 2 / s
  const result = d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg))
  return isNaN(result) ? 0 : result
}

// 检查页面栈中是否已打开此路径
export function checkIsOpenPage(url) {
  const pages = getCurrentPages()
  const paths = pages.map(v => `/${v.route || v.__route__ || v.is}`)

  let key = url
  const index = key.indexOf('?')

  if (index !== -1) {
    key = key.slice(0, index)
  }
  return paths.lastIndexOf(key)
}

export function arrChunk(arr = [], num = 3) {
  arr = arr.sort((a, b) => a - b)

  function afterAdd() {
    if (arr.length >= num) return []
    const v1 = arr[0]
    const v2 = arr[arr.length - 1]

    if (v2 - v1 > 1) {
      arr.push(v1 + 1)
    } else {
      arr.push(v2 + 1)
    }
    arr.sort((a, b) => a - b)
    return arr
  }
  function beforeAdd() {
    if (arr.length >= num) return
    const v = arr[0]
    if (v < 1) {
      afterAdd()
    } else {
      arr.unshift(v - 1)
    }
  }
  afterAdd()
  beforeAdd()
  return arr
}

export function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  )
}

export function getNetWorkInfo() {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: res => {
        let state

        // @if weixin
        state = res.networkType !== 'none'
        // @endif
        // @if alipay
        state = res.networkAvailable
        // @endif

        resolve({
          state,
          type: res.networkType,
        })
      },
      fail: reject,
    })
  })
}

const { tabBarList } = wx.getExtConfigSync()

export function checkIsNativeTabberPage(path) {
  return tabBarList && tabBarList.some(item => item.pagePath === path.slice(1))
}

export function hasCustomNativeTabber() {
  return tabBarList ? tabBarList.length : 0
}

export function filterPagePathParams(path = '') {
  const ind = path.indexOf('?')
  return ind !== -1 ? path.slice(0, ind) : path
}

export function formatKmUnit(m = 0, leng = 1) {
  return m / 1000 >= 1 ? `${(m / 1000).toFixed(leng)}km` : `${m}m`
}

// 获取某点位置至当前位置的距离
export function getDistance(data) {
  const lat = parseFloat(data.lat)
  const lng = parseFloat(data.lng)
  return new Promise((resolve, reject) => {
    getLocation()
      .then(res => {
        let distance = 0
        if (lat != res.latitude && lng != res.longitude) {
          distance = calcPointDistance(lat, lng, res.latitude, res.longitude)
        }
        if (distance >= 1000) {
          distance = parseFloat(distance / 1000).toFixed(2) + 'km'
        } else if (distance > 0 && distance < 1000) {
          distance = parseInt(distance) + 'm'
        }
        resolve(distance)
      })
      .catch(reject)
  })
}

// 计算优惠券门槛
export const calcThreshold = info => {
  const thresholdType = Number(info.thresholdType)
  if (thresholdType === 1) {
    // 无门槛
    return 0
  } else if (thresholdType === 2) {
    // 有门槛
    return parseFloat(info.useThreshold)
  }
  return Infinity
}

// 格式化优惠券有效期
export const formatValidDateText = (info, formatStr = 'YYYY.MM.DD') => {
  let validDateText = ''
  const validType = Number(info.validType)
  if (validType === 1) {
    validDateText = `${dayjs(info.validBeginDate).format(formatStr)}-${dayjs(
      info.validEndDate
    ).format(formatStr)}`
  } else if (validType === 2) {
    const validStartDay = Number(info.validStartDay)
    validDateText = '获得券'
    if (validStartDay === 0) {
      validDateText += '当日起'
    } else if (validStartDay === 1) {
      validDateText += '次日起'
    }
    validDateText += `${info.validDays}日内有效`
  }

  return validDateText
}

export const formatCouponValidDateText = (info, formatStr = 'YYYY.MM.DD') => {
  let validDateText = ''
  const validType = Number(info.validType)
  if (validType === 1) {
    validDateText = `有效期至${dayjs(info.validEndDate).format(formatStr)}`
  } else if (validType === 2) {
    const validStartDay = Number(info.validStartDay)
    validDateText += `${validStartDay === 1 ? '次日起' : ''}${info.validDays}日内有效`
  }

  return validDateText
}

export const formatValidDateRangeText = (start, end, formatStr = 'YYYY.MM.DD') =>
  `${dayjs(start).format(formatStr)}-${dayjs(end).format(formatStr)}`

export function range(num, min, max) {
  return Math.min(Math.max(num, min), max)
}

/**
 * 计算倒计时
 */
const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const padZero = num => (num > 9 ? '' : '0') + num
export const calcCountdown = restSecond => {
  const day = padZero(Math.floor(restSecond / DAY))
  const hour = padZero(Math.floor((restSecond % DAY) / HOUR))
  const minute = padZero(Math.floor((restSecond % HOUR) / MINUTE))
  const second = padZero(Math.floor(restSecond % MINUTE))
  return { day, hour, minute, second }
}

/**
 * 计算折扣价
 */
const MIN_PRICE = 0.01
export const CALC_MAP = {
  discount: (price, value) => {
    const discountAmount = numCalc('/', numCalc('*', price, numCalc('-', 10, value)), 10)
    const result = numCalc('-', price, sumToFixed(discountAmount, 2))
    return Math.max(parseFloat(result), MIN_PRICE)
  },
  amount: (price, value) => {
    const result = numCalc('-', price, value)
    return Math.max(parseFloat(result), MIN_PRICE)
  },
}

/**
 * 获取折扣类型值
 */
export const DISCOUNT_TYPE_MAP = {
  1: 'discount',
  2: 'amount',
}

/**
 * 请求授权
 * @param {string} authName - 权限名称
 * @param {boolean} silent - 不输出reject
 */
export function askAuth(authName, silent = true) {
  return new Promise((resolve, reject) => {
    if (silent) {
      reject = () => {}
    }
    wx.getSetting({
      success: ({ authSetting }) => {
        let key
        // @if weixin
        key = `scope.${authName}`
        // @endif
        // @if alipay
        key = authName
        // @endif
        if (key in authSetting) {
          if (authSetting[key]) {
            resolve()
          } else {
            wx.openSetting({
              success: ({ authSetting: authSettingAfterOpen }) => {
                if (authSettingAfterOpen[key]) {
                  resolve()
                } else {
                  // eslint-disable-next-line prefer-promise-reject-errors
                  reject('未开启权限')
                }
              },
              fail: reject,
            })
          }
        } else {
          resolve()
        }
      },
      fail: reject,
    })
  })
}

// 判断是否是iphoneX，适配
export function isIphoneX() {
  const systemInfo = wx.getSystemInfoSync()
  const { model, platform, screenWidth, screenHeight } = systemInfo
  return (
    model.toUpperCase().search('IPHONE X') !== -1 ||
    (platform.toUpperCase() === 'IOS' &&
      ((screenHeight === 812 && screenWidth === 375) ||
        (screenHeight === 896 && screenWidth === 414)))
  )
}

/**
 * 获取小程序码的传递参数
 * @param {object} options - 页面参数
 * @param {string[]} fields - 字段名称，微信、支付宝
 * @param {string} route - 路由名称
 */
export const getMpCodeQuery = (options = {}, [wechatField, alipayField = wechatField], route) => {
  let query
  // @if weixin
  if (options[wechatField]) {
    query = options[wechatField]
  }
  // @endif
  // @if alipay
  const mpCodeQuery = getApp().launchQuery[route]
  if (mpCodeQuery && mpCodeQuery[alipayField]) {
    query = mpCodeQuery[alipayField]
    delete getApp().launchQuery[route]
  } else if (options[alipayField]) {
    query = options[alipayField]
  }
  // @endif
  return query
}

export function trim(str) {
  if (String.prototype.trim) {
    return String(str).trim()
  } else {
    return String(str).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '')
  }
}

export function bindKeyInput(e) {
  const { key } = e.currentTarget.dataset
  this.setData({ [key]: e.detail.value })
}

export function noop() {}

export function get(from, ...selectors) {
  const func = s =>
    s
      .replace(/\[([^[\]]*)\]/g, '.$1.')
      .split('.')
      .filter(t => t !== '')
      .reduce((prev, cur) => prev && prev[cur], from)

  return selectors.length === 1 ? func(selectors[0]) : [...selectors].map(func)
}

export async function wrapLoadList(func, params = {}, dispatchListFunc, mapItems = {}) {
  // 是否锁定上拉加载，默认值false
  const _lock = mapItems._lock || '_lock'
  // 列表的当前页数，默认值1
  const _page = mapItems._page || '_page'
  // 添加内容的列表key
  const listKey = mapItems.listKey || 'storeList'
  // 列表加载状态，用于 load-more 的显示状态切换，默认''
  const loadState = mapItems.loadState || 'loadState'
  // 接口返回字段映射
  const mapRes = Object.assign(
    {
      current_page: 'current_page',
      last_page: 'last_page',
      list: 'list',
    },
    mapItems.mapRes || null
  )

  this[_lock] = true

  try {
    const res = await func(isFunction(params) ? params() : params)
    const old = this.data[listKey]
    const curr = isFunction(dispatchListFunc)
      ? dispatchListFunc(get(res.data, mapRes.list))
      : get(res.data, mapRes.list)
    this[_page] = get(res.data, mapRes.current_page)

    // XXX 解决中台服务不返回总页数的处理方案：
    if (mapRes.hasNextPage) {
      this[_lock] = !get(res.data, mapRes.hasNextPage)
    } else {
      this[_lock] = this[_page] >= get(res.data, mapRes.last_page)
    }
    // 添加标记，用于标识列表是否锁定
    const list = this[_page] > 1 ? old.concat(...curr) : curr
    list.__lock__ = this[_lock]

    this.setData({
      [listKey]: list,
      [loadState]: this[_lock] ? 'end' : 'loading',
    })
  } catch (err) {
    if (this[_page] > 1) {
      this[_page]--
    }
    this.setData({
      [loadState]: 'loading',
    })
    this[_lock] = false
    throw err
  }
}
