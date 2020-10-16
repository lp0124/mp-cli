import { $component } from '@/libs/mpext'
import userModel from '@/models/user'
import { setIsAuth } from '@/store/actions/var'
import { promisifyArr } from '@/helpers/promisify'
import { isBoolean } from '@/helpers/types'

const p = promisifyArr(['getPhoneNumber'])

const ISV_APPID = {
  dev: '2018061560398413',
  test: '2018062060364747',
  master: '2018062060400667',
}
const EXT_CONFIG = my.getExtConfigSync() || {}
const CURR_ISV_APPID = ISV_APPID[EXT_CONFIG.env || 'master']

$component({
  mapState: ['isAuth'],
  mapDispatch: { setIsAuth },
})({
  props: {
    onSuccess() {},
    onPopUpsAuthHide() {},
    skip: true, // 是否跳过
    force: false, // 是否强制
    style: '', // 按钮样式
    disabled: false,
    trigger: {},
  },
  didMount() {
    this._lock = false
  },
  didUpdate(prevProps) {
    const state = this.props.trigger.state

    if (isBoolean(state) && this.props.trigger !== prevProps.trigger) {
      // 手动触发
      if (state || !this.props.force) {
        this.props.onSuccess()
      }
    }
  },
  methods: {
    async getPhoneNumber() {
      if (this.props.skip || this.data.$store.isAuth) {
        this.props.onSuccess()
        return
      }
      // 调起支付宝的授权手机号API
      try {
        const res = await p.getPhoneNumber({
          protocols: {
            isvAppId: CURR_ISV_APPID,
          },
        })
        const { sign, response } = JSON.parse(res.response)
        await userModel.bindMobile({
          sign,
          encrypted_data: response,
        })
        this.setIsAuth(true)
        this.props.onSuccess()
      } catch (err) {
        // 使用弹框-发送验证码方式获取手机号
        this.props.onPopUpsAuthHide({
          visible: true,
        })
      }
    },
    onAuthError() {
      if (!this.props.force) {
        this.props.onSuccess()
      }
      this.props.onPopUpsAuthHide({
        visible: false,
      })
    },
  },
})
