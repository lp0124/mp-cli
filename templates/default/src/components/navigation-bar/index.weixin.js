import { $component } from '@/libs/mpext'
import { reLaunch } from '@/helpers/router'
import storage from '@/helpers/storage'

$component({
  mapState: ['canUse', 'system'],
})({
  options: {
    multipleSlots: true,
    addGlobalClass: true,
  },

  properties: {
    extClass: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    background: {
      type: String,
      value: '',
    },
    color: {
      type: String,
      value: '',
    },
    loading: {
      type: Boolean,
      value: false,
    },
    animated: {
      type: Boolean,
      value: true,
    },
    show: {
      type: Boolean,
      value: true,
      observer: '_showChange',
    },
    delta: {
      type: Number,
      value: 1,
    },
    notShowHome: {
      type: Boolean,
      value: false,
    },
    fixed: {
      type: Boolean,
      value: false,
    },
    // 若出现返回首页按钮，则返回的是子店铺首页
    backStoreHome: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    displayStyle: '',
    showBack: false,
    showHome: false,
    innerWidth: '',
    innerPaddingRight: '',
    leftWidth: '',
  },

  pageLifetimes: {
    // 修复ios下返回箭头未及时更新
    show() {
      this.updateIconState()
    },
  },

  attached() {
    const isSupport = !!wx.getMenuButtonBoundingClientRect
    const rect = isSupport ? wx.getMenuButtonBoundingClientRect() : null
    const { windowWidth } = this.data.$store.system

    this.setData({
      innerWidth: isSupport ? `width:${rect.left}px` : '',
      innerPaddingRight: isSupport ? `padding-right:${windowWidth - rect.left}px` : '',
      leftWidth: isSupport ? `width:${windowWidth - rect.left}px` : '',
    })

    this.updateIconState()
  },

  methods: {
    updateIconState() {
      const leng = getCurrentPages().length
      this.setData({
        showBack: leng > 1,
        showHome: leng === 1 && !this.data.notShowHome,
      })
    },
    _showChange(show) {
      let displayStyle = ''
      if (this.data.animated) {
        displayStyle = `opacity: ${
          show ? '1' : '0'
        }; -webkit-transition: opacity 0.5s; transition: opacity 0.5s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'}`
      }
      this.setData({ displayStyle })
    },
    back() {
      const delta = this.data.delta
      wx.navigateBack({ delta })
      this.triggerEvent('back', { delta }, {})
    },
    handleHome() {
      if (this.data.backStoreHome) {
        reLaunch(`/pages/store/index?scene=${storage.get('store_id')}-${storage.get('shop_id')}`)
      } else {
        storage.remove('pageIndex__back_store_index')
        reLaunch('/pages/index/index')
      }
    },
  },
})
