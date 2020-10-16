import { isNull } from './types'

class Storage {
  prefix: string

  constructor(namespace = '') {
    this.prefix = namespace ? `__${namespace}__` : ''
  }

  _buildKey(key: any) {
    return `${this.prefix}${key}`
  }

  get(key: string) {
    let result
    // @if weixin
    result = wx.getStorageSync(this._buildKey(key))
    // @endif
    // @if alipay
    // @ts-ignore
    const val = my.getStorageSync({ key: this._buildKey(key) }).data
    result = isNull(val) ? '' : val
    // @endif
    return result
  }

  set(key: string, data: number | boolean | any[]) {
    // @if weixin
    wx.setStorageSync(this._buildKey(key), data)
    // @endif
    // @if alipay
    // @ts-ignore
    my.setStorageSync({
      key: this._buildKey(key),
      data,
    })
    // @endif
  }

  remove(key: string) {
    // @if weixin
    wx.removeStorageSync(this._buildKey(key))
    // @endif
    // @if alipay
    // @ts-ignore
    my.removeStorageSync({
      key: this._buildKey(key),
    })
    // @endif
  }
}

export default new Storage()
