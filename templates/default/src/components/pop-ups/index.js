import { $component } from '@/libs/mpext'
import { delay } from '@/helpers/util'
import { nextTick } from '@/helpers/nextTick'

$component()({
  properties: {
    // 是否显示
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (this.data.transition !== 'none' && this.data.duration > 0) {
          const { position } = this.data
          if (newVal) {
            this.setData({
              innerShow: true,
              maskClass: 'c-pop-ups__mask--hidden',
              transitionClass: `${position}-hidden`,
            })
            Promise.resolve()
              .then(nextTick)
              .then(() => {
                this.setData({
                  maskClass: 'c-pop-ups__mask--visible',
                  transitionClass: `${position}-visible`,
                })
              })
          } else {
            if (this.data.transitionClose) {
              this.setData(
                {
                  maskClass: 'c-pop-ups__mask--hidden',
                  transitionClass: `${position}-hidden`,
                },
                () => {
                  delay(this.data.duration).then(() => this.setData({ innerShow: false }))
                }
              )
            } else {
              this.setData({ innerShow: false })
            }
          }
        } else {
          this.setData({ innerShow: newVal })
        }
      },
    },
    // 弹窗层级
    zIndex: {
      type: Number,
      value: 500,
    },
    // 是否显示蒙层
    mask: {
      type: Boolean,
      value: true,
    },
    // 蒙层背景
    background: {
      type: String,
      value: 'rgba(0, 0, 0, 0.6)',
    },
    /**
     * 是否点击蒙层关闭弹窗
     * 值为 true 时应主动绑定 close 事件关闭弹窗
     */
    closable: {
      type: Boolean,
      value: true,
    },
    /**
     * 弹窗展示位置
     * 可选值：center、top、bottom、left、right
     */
    position: {
      type: String,
      value: 'center',
    },
    /**
     * 过渡动画时间曲线
     * 值为 none 时禁用过渡动画
     */
    transition: {
      type: String,
      value: 'ease',
    },
    /**
     * 过渡动画时长，单位毫秒(ms)
     * 值不大于 0 时禁用过渡动画
     */
    duration: {
      type: Number,
      value: 300,
    },
    // 弹窗关闭时是否使用过渡动画
    transitionClose: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    innerShow: false,
    maskClass: '',
    transitionClass: '',
  },
  methods: {
    noop() {},
    close() {
      if (!this.data.closable) return
      this.triggerEvent('close')
    },
  },
})
