import '@/helpers/polyfill'
import '@/helpers/setupStore'
import '@/helpers/ext'

import { useDispatch } from '@/libs/mpext'
import { getBasicInfo } from '@/store/multiActions'
import { compelUpdateApp } from '@/helpers/util'
import EventEmitter from '@/libs/EventEmitter'
import { reLaunch } from './helpers/router'
import { isPlainObject } from './helpers/types'

const dispatch = useDispatch()

App({
  async onLaunch(options) {
    // 强制更新
    compelUpdateApp()

    dispatch(getBasicInfo())
  },
  onShow(options) {
    // 处理小程序码的参数
    const { query = {}, path } = options
    if (path && isPlainObject(query)) {
      this.launchQuery[path] = query
    }

    const { q /* 微信 */, qrCode /* 支付宝 */ } = query
    const codeUrl = q || qrCode
    if (codeUrl) {
      // 获取关联普通二维码的码值
    }
  },
  onPageNotFound(res) {
    reLaunch('/pages/index/index', res.query)
  },
  eventEmitter: new EventEmitter(),
  launchQuery: {},
})
