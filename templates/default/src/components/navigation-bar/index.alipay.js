import { $component } from '@/libs/mpext'
import { delay } from '@/helpers/util'

$component({
  mapState: ['storeTheme', 'system'],
})({
  props: {
    title: '',
    color: '#000000',
    background: '#ffffff',
    notShowHome: false,
    placeholderHomeBtn: false,
    fixed: false,
  },
  data: {
    showBack: false,
    showHome: false,
  },

  didMount() {
    this.setNavigationBar()
    this.updateIconState()
  },
  didUpdate(prevProps) {
    if (prevProps.background !== this.props.background) {
      this.setNavigationBar()
    }
    this.updateIconState()
  },

  methods: {
    async updateIconState() {
      await delay(300)
      const leng = getCurrentPages().length
      this.setData({
        showBack: leng > 1,
        showHome: leng === 1 && !this.props.notShowHome,
      })
    },
    setNavigationBar() {
      const { background } = this.props
      // 仅支持十六进制颜色值
      if (background.slice(0, 1) === '#') {
        my.setNavigationBar({
          backgroundColor: background,
        })
      }
    },
  },
})
