import { $component } from '@/libs/mpext'
import prompt from '@/helpers/prompt'
import { isMobile } from '@/helpers/util'
import userModel from '@/models/user'
import { setIsAuth } from '@/store/actions/var'
import { isBoolean } from '@/helpers/types'
// import { navigate } from '@/helpers/router'

$component({
  mapState: ['currentShop', 'storeName'],
  mapDispatch: { setIsAuth },
})({
  props: {
    onHide() {},
    visible: false,
  },
  data: {
    isShow: false,
    form: {
      mobile: '',
      verify_code: '',
    },
  },
  didMount() {
    this._isLock = false
    this.observeData()
  },
  didUpdate(prevProps) {
    if (this.props.visible !== prevProps.visible) {
      this.observeData('visible')
    }
  },
  methods: {
    resetData() {
      this.setData({
        form: {
          mobile: '',
          verify_code: '',
        },
      })
    },
    observeData(type) {
      if (!type || type === 'visible') {
        this.resetData()
        this.setData({
          isShow: this.props.visible,
        })
      }
    },
    hide(state) {
      // 锁定期间禁止关闭弹框
      if (this._isLock) return
      // 触发关闭弹框事件，返回授权结果
      this.props.onHide({
        visible: false,
        state: isBoolean(state) ? state : false,
      })
    },
    bindKeyInput(e) {
      const { key } = e.currentTarget.dataset
      this.setData({ [key]: e.detail.value })
    },
    async getPhoneNumber() {
      if (this._isLock) return
      if (!this.checkForm(1)) return
      try {
        this._isLock = true
        my.showLoading({
          content: '操作处理中',
        })
        await userModel.bindMobile(
          {
            mobile: this.data.form.mobile,
            verify_code: this.data.form.verify_code,
          },
          'code'
        )
        my.hideLoading()
        this._isLock = false
        this.authSuccess()
      } catch (err) {
        my.hideLoading()
        this._isLock = false
        // 若已绑定手机号
        if (err && String(err.code).slice(-3) === '401') {
          this.authSuccess()
          return
        }
        if (err.errMsg) {
          prompt.toast(err.errMsg)
        }
      }
    },
    async sendSms() {
      if (!this.checkForm()) return
      try {
        await userModel.sendSms({
          mobile: this.data.form.mobile,
          type: 'bind_mobile',
        })
        prompt.toast('验证码发送成功')
      } catch (err) {
        prompt.toast(err.errMsg)
      }
    },
    authSuccess() {
      this.setIsAuth(true)
      this.hide(true)
      getApp().eventEmitter.emit('browse-shop')
    },
    checkForm(flag) {
      const { mobile, verify_code } = this.data.form
      if (!mobile) {
        prompt.toast('请输入手机号')
        return false
      }
      if (!isMobile(mobile)) {
        prompt.toast('请输入正确的手机号')
        return false
      }
      if (flag && !verify_code) {
        prompt.toast('请输入验证码')
        return false
      }
      return true
    },
    // navWebview(e) {
    //   navigate('/pages/webview/index', {
    //     src: e.currentTarget.dataset.src,
    //   })
    // },
  },
})
