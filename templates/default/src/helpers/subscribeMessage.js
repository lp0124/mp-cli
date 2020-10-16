// @if weixin
import { useState, useDispatch } from '@/libs/mpext'
import { fetchSubscribeId } from '@/models/store'
import { setIsShowSubscribeMessageTip, setSubscribeMessageKeys } from '@/store/actions/var'

const dispatch = useDispatch()

export async function authSubscribe(keys) {
  if (keys) {
    dispatch(setSubscribeMessageKeys(keys))
  }
  // 获取订阅消息ID
  const res = await fetchSubscribeId({
    keys: keys || useState().subscribeMessageKeys,
  }).catch(() => {})

  if (!res || !res.data || !res.data.messages) return

  const tmplIds = res.data.messages

  // 未开启任何订阅消息时跳过
  if (tmplIds.length < 1) {
    dispatch(setIsShowSubscribeMessageTip(false))
    return
  }

  wx.requestSubscribeMessage({
    tmplIds,
    success(mRes) {
      // 是否存在用户拒绝订阅的模板消息
      const result = Object.keys(mRes).some(k => mRes[k] === 'reject')
      dispatch(setIsShowSubscribeMessageTip(result))
      // 若是用户手动点击订阅且已全部订阅
      if (!keys && !result) {
        wx.showToast({ title: '订阅成功' })
      }
    },
    fail() {
      // 调取api失败
      dispatch(setIsShowSubscribeMessageTip(true))
    },
  })
}
// @endif
