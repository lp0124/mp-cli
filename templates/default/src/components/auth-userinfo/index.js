import { $component } from '@/libs/mpext'
import userModel from '@/models/user'
import prompt from '@/helpers/prompt'
// @if alipay
import { promisifyArr } from '@/helpers/promisify'
// @endif

$component({
  mapState: ['user_info'],
})({
  properties: {
    // 是否跳过授权
    skip: {
      type: Boolean,
      value: true,
    },
    // 是否强制授权
    force: {
      type: Boolean,
      value: false,
    },
    // 是否更新授权
    update: {
      type: Boolean,
      value: false,
    },
  },
  attached() {
    this._lock = false
  },
  methods: {
    async onGotUserInfo(e) {
      if (this._lock) return
      if (!this.data.update && (this.data.skip || this.data.$store.user_info.nickname)) {
        this.triggerEvent('confirm')
        return
      }
      // @if weixin
      const { errMsg, encryptedData, iv } = e.detail
      if (errMsg === 'getUserInfo:ok') {
        try {
          this._lock = true
          await userModel.updateInfo({ encrypted_data: encryptedData, iv })
          this.triggerEvent('confirm')
          getApp().eventEmitter.emit('browse-shop')
        } catch (err) {
          if (err.errMsg) {
            prompt.toast(err.errMsg)
          }
        } finally {
          this._lock = false
        }
      } else {
        if (!this.data.force) {
          this.triggerEvent('confirm')
        }
      }
      // @endif
      // @if alipay
      try {
        const p = promisifyArr(['getAuthCode'])
        const authInfo = await p.getAuthCode({ scopes: ['auth_user'] })
        this._lock = true
        await userModel.updateInfo({
          type: 'aliapp',
          is_silent: 0,
          code: authInfo.authCode,
        })
        this._lock = false
        this.triggerEvent('confirm')
        getApp().eventEmitter.emit('browse-shop')
      } catch (err) {
        this._lock = false
        // 取消授权
        if (!this.data.force) {
          this.triggerEvent('confirm')
        }
      }
      // @endif
    },
  },
})
