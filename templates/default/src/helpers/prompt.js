import { useState } from '@/libs/mpext'
import { promisifyArr } from './promisify'

let p
// @if weixin
p = promisifyArr(['showToast', 'showModal'])
// @endif
// @if alipay
p = promisifyArr(['showToast', 'alert', 'confirm'])
// @endif

class Prompt {
  toast(title, { icon = 'none', duration = 1500 } = {}) {
    if (!title) return null
    let result
    // @if weixin
    result = p.showToast({ title, icon, duration, mask: true })
    // @endif
    // @if alipay
    result = p.showToast({ content: title, type: icon, duration, mask: true })
    // @endif
    return result
  }

  alert(title, content, options) {
    if (title && !content) {
      content = title
      title = ''
    }
    return (
      p
        // @if weixin
        .showModal({
          title,
          content,
          showCancel: false,
          confirmColor: useState().extConfig.colorTheme,
          ...options,
        })
        // @endif
        // @if alipay
        .alert({ title, content, ...options })
        // @endif
        .then(res => (res.confirm ? Promise.resolve() : Promise.reject()))
    )
  }

  confirm(title, content, { confirmText = '确定', cancelText = '取消' } = {}) {
    let result
    // @if weixin
    result = p
      .showModal({ title, content, showCancel: true, confirmText, cancelText })
      .then(res => {
        if (res.confirm) return Promise.resolve()
        return Promise.reject()
      })
    // @endif
    // @if alipay
    result = p
      .confirm({ title, content, confirmButtonText: confirmText, cancelButtonText: cancelText })
      .then(res => {
        if (res.confirm) return Promise.resolve()
        return Promise.reject()
      })
    // @endif
    return result
  }

  showLoading(title = '加载中') {
    // @if weixin
    wx.showLoading({ title, mask: true })
    // @endif
    // @if alipay
    my.showLoading({ content: title, mask: true })
    // @endif
  }

  hideLoading() {
    // @if weixin
    wx.hideLoading()
    // @endif
    // @if alipay
    my.hideLoading()
    // @endif
  }
}

export default new Prompt()
