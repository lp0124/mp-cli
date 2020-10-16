interface NativeApi {
  showToast: unknown
  getLocation: unknown
  getSetting: unknown
  openSetting: unknown
  // @if weixin
  requestPayment: unknown
  showModal: unknown
  checkSession: unknown
  login: unknown
  scanCode: unknown
  // @endif
  // @if alipay
  getAuthCode: unknown
  alert: unknown
  confirm: unknown
  scan: unknown
  getPhoneNumber: unknown
  // @endif
}
type Func = (option: Record<string, unknown>) => Promise<unknown>

// 将一个微信的异步API进行Promise化
function promisify(apiName: keyof NativeApi): Func {
  return options => {
    return new Promise((resolve, reject) => {
      // @ts-ignore
      const fn = wx[apiName] as Function
      fn({
        ...options,
        success: resolve,
        fail: reject,
      } as any)
    })
  }
}

// 将多个微信的异步API进行Promise化
export function promisifyArr(nameList: (keyof NativeApi)[]) {
  return nameList.reduce((acc: { [x: string]: Func }, name: keyof NativeApi) => {
    acc[name] = promisify(name)
    return acc
  }, {})
}
