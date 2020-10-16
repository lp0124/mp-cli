export function isIOS() {
  const system = wx.getSystemInfoSync()
  return system.platform !== 'android'
}

export function getSystem() {
  const system = wx.getSystemInfoSync()
  const android = system.platform === 'android'
  const statusBarHeight = system.statusBarHeight || 0

  let titleBarHeight
  // @if weixin
  titleBarHeight = android ? 48 : 44
  // @endif
  // @if alipay
  titleBarHeight = system.titleBarHeight
  // @endif
  const titleHeight = statusBarHeight + titleBarHeight

  return {
    android,
    ios: !android,
    statusBarHeight,
    titleBarHeight,
    titleHeight,
    windowWidth: system.windowWidth,
    windowHeight: system.windowHeight,
    SDKVersion: system.SDKVersion,
  }
}
