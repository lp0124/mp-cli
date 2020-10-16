import { $component } from '@/libs/mpext'
import userModel from '@/models/user'
import { setIsAuth } from '@/store/actions/var'

$component({
  mapState: ['isAuth'],
  mapDispatch: { setIsAuth },
})({
  properties: {
    skip: {
      // 是否跳过
      type: Boolean,
      value: true,
    },
    force: {
      // 是否强制
      type: Boolean,
      value: false,
    },
    style: {
      // 按钮样式
      type: String,
      value: '',
    },
  },
  attached() {
    this._lock = false
  },
  methods: {
    handleTap() {
      this.triggerEvent('success')
    },
    async getPhoneNumber(e) {
      const { encryptedData, iv } = e.detail
      if (this._lock) return
      if (!encryptedData || !iv) {
        if (!this.data.force) {
          this.triggerEvent('success')
        }
        return
      }
      try {
        this._lock = true
        await userModel.bindMobile({
          iv,
          encrypted_data: encryptedData,
        })
        this.authSuccess()
      } catch (err) {
        if (err && String(err.code).slice(-3) === '401') {
          this.authSuccess()
        } else {
          wx.showToast({
            icon: 'none',
            title: err.errMsg,
          })
        }
      } finally {
        this._lock = false
      }
    },
    authSuccess() {
      this.setIsAuth(true)
      this.triggerEvent('success')
      this.triggerEvent('change')
      getApp().eventEmitter.emit('browse-shop')
    },
  },
})
