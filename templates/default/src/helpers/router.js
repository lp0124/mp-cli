import { concatParamsObj } from './util'
import { promisifyArr } from '@/helpers/promisify'
import { isString, isPlainObject } from './types'

const p = promisifyArr(['navigateBack'])

function beforeRouteEnter(res, next) {
  next()
}

function router(type, e, params) {
  let url = isString(e) ? e : e.currentTarget.dataset.url

  beforeRouteEnter(
    {
      url,
      type,
      e: isString(e) ? null : e,
      params,
    },
    () => {
      if (isPlainObject(params)) {
        url += concatParamsObj(params)
      }
      wx[type]({
        url,
      })
    }
  )
}

// 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面
export function navigate() {
  router.call(this, 'navigateTo', ...arguments)
}
// 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
export function redirect() {
  router.call(this, 'redirectTo', ...arguments)
}
// 关闭所有页面，打开到应用内的某个页面
export function reLaunch() {
  router.call(this, 'reLaunch', ...arguments)
}
// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
export function switchTab() {
  router.call(this, 'switchTab', ...arguments)
}

export function back(delta = 1) {
  return p.navigateBack({
    delta,
  })
}

/**
 * 获取指定层级页面的路径
 * @param {Number} delta 页面层数 从0开始 0或者不传是当期页 1是上一页面
 */
export function getPageRoute(delta) {
  const currentPages = getCurrentPages()
  const pagesDelta = currentPages.length - 1 - Number(delta || 0)
  if (pagesDelta > -1) {
    return currentPages[pagesDelta] ? currentPages[pagesDelta].route : ''
  } else {
    return ''
  }
}
