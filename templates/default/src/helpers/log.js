import { getPageRoute } from './router'
import storage from './storage'

const PAGE_TYPE = {
  'pages/store/index': 'indexPage',
  'pages/goods/index': 'goodsList',
  'pages/goods/detail': 'goodsDetail',
  'pages/order/confirm': 'orderConfirm',
  'pages/order/list': 'orderCenter',
  'pages/order/detail': 'orderFinish',
  'pages/my/index': 'userCenter',
  'pages/pay/index': 'payBill',
}
const HTTP_LOG_BASE_URL = {
  dev: 'https://logger.zmcms.cn',
  test: 'https://logger.qimai.shop',
  beta: 'https://logger.qmai.co',
  master: 'https://logger.qmai.cn',
}
const EXT_CONFIG = wx.getExtConfigSync() || {}

export function reportLog(customs = {}) {
  const location = storage.get('location')
  const systemInfo = wx.getSystemInfoSync()

  let psc = ''
  // @if weixin
  psc = 'wx'
  // @endif
  // @if alipay
  psc = 'alipay'
  // @endif

  const params = {
    // 来源
    sc: storage.get('sc'),
    // 店铺ID
    sid: storage.get('store_id') || '',
    // 门店ID
    mid: storage.get('shop_id') || '',
    // 用户ID
    uid: storage.get('user_info')?.id || '',
    // 小程序Appid
    aid: EXT_CONFIG.appid,
    // 经度
    lng: location?.longitude || '',
    // 纬度
    lat: location?.latitude || '',
    // 平台来源
    psc,
    // 当期的APP日志统计的唯一标识
    alid: getApp()?.__logUnionId__ || '',
    // 系统标识
    sys: {
      b: systemInfo.brand,
      m: systemInfo.model,
      s: systemInfo.system,
    },
    // 页面类型
    ty: PAGE_TYPE[customs[customs.ac === 'event' ? 'bp' : 'cp']] || 'other',
  }

  const header = {
    'Qm-From': 'wechat',
    'Qm-From-Type': 'reta',
    'Content-type': 'application/json',
    Accept: 'v=1.0',
  }

  wx.request({
    method: 'POST',
    url: HTTP_LOG_BASE_URL[EXT_CONFIG.env || 'master'] + '/record.do',
    data: Object.assign(params, customs),
    dataType: 'json',
    // @if weixin
    header,
    // @endif
    // @if alipay
    headers: header,
    timeout: 6000,
    // @endif
  })
}

export function reportEnterAppLog() {
  reportLog({
    ac: 'enterApp',
    // 当前页面
    cp: getPageRoute(),
    // 上一个页面
    bp: getPageRoute(1),
  })
}

export function reportLeaveAppLog() {
  reportLog({
    ac: 'leaveApp',
    // 当前页面
    cp: getPageRoute(),
    // 上一个页面
    bp: getPageRoute(1),
  })
}

export function reportEnterPageLog(page) {
  reportLog({
    ac: 'enterPage',
    // 携带的参数
    q: page.__options__,
    // 当前页面
    cp: page.route,
    // 上一个页面
    bp: page.__prevRoute__,
    // 页面的日志唯一标识
    plid: page.__logPageUnionId,
  })
}

export function reportLeavePageLog(page) {
  reportLog({
    ac: 'leavePage',
    // 当前页面
    cp: page.route,
    // 上一个页面
    bp: page.__prevRoute__,
    // 页面的日志唯一标识
    plid: page.__logPageUnionId,
  })
}

export function reportReturnPageLog(page) {
  reportLog({
    ac: 'returnPage',
    // 当前页面
    cp: page.route,
    // 上一个页面
    bp: page.__prevRoute__,
    // 页面的日志唯一标识
    plid: page.__logPageUnionId,
  })
}

export function reportEventLog(page, eventName) {
  reportLog({
    ac: 'event',
    // 事件名字
    cp: eventName,
    // 当前页面
    bp: page.route,
    // 页面的日志唯一标识
    plid: page.__logPageUnionId,
  })
}
