import { $component } from '@/libs/mpext'
import { range } from '@/helpers/util'

const THRESHOLD = 0.3
const MIN_DISTANCE = 10

let refs = []

function getDirection(x, y) {
  if (x > y && x > MIN_DISTANCE) {
    return 'horizontal'
  }
  if (y > x && y > MIN_DISTANCE) {
    return 'vertical'
  }
  return ''
}

$component({})({
  properties: {
    // 是否禁用滑动
    disabled: {
      type: Boolean,
      value: false,
    },
    // 左侧滑动区域宽度
    leftWidth: {
      type: Number,
      value: 0,
      observer(leftWidth) {
        if (leftWidth === undefined) {
          leftWidth = 0
        }
        if (this.offset > 0) {
          this.swipeMove(leftWidth)
        }
      },
    },
    // 右侧滑动区域宽度
    rightWidth: {
      type: Number,
      value: 0,
      observer(rightWidth) {
        if (rightWidth === undefined) {
          rightWidth = 0
        }
        if (this.offset < 0) {
          this.swipeMove(-rightWidth)
        }
      },
    },
    // 是否异步关闭
    asyncClose: {
      type: Boolean,
      value: false,
    },
    // 标识符，可以在 close 事件的参数中获取到
    name: {
      type: [Number, String],
      value: '',
    },
  },
  attached() {
    this.offset = 0
    refs.push(this)
  },
  destroyed() {
    refs = refs.filter(item => item !== this)
  },
  methods: {
    open(position) {
      const { leftWidth, rightWidth } = this.data
      const offset = position === 'left' ? leftWidth : -rightWidth
      this.swipeMove(offset)
      this.triggerEvent('open', {
        position: position,
        name: this.data.name,
      })
    },
    close() {
      this.swipeMove(0)
    },
    closeOther() {
      this.swipeMove(0, 'other')
    },
    swipeMove(offset, type) {
      if (type === 'other' && this.offset === 0) {
        return
      }
      if (offset === undefined) {
        offset = 0
      }
      this.offset = range(offset, -this.data.rightWidth, this.data.leftWidth)
      const transform = `translate3d(${this.offset}px, 0, 0)`
      const transition = this.dragging ? 'none' : 'transform .6s cubic-bezier(0.18, 0.89, 0.32, 1)'
      this.setData({
        wrapperStyle: `
          -webkit-transform: ${transform};
          transform: ${transform};
          -webkit-transition: ${transition};
          transition: ${transition};
        `,
      })
    },
    swipeLeaveTransition() {
      const { leftWidth, rightWidth } = this.data
      const offset = this.offset
      if (rightWidth > 0 && -offset > rightWidth * THRESHOLD) {
        this.open('right')
      } else if (leftWidth > 0 && offset > leftWidth * THRESHOLD) {
        this.open('left')
      } else {
        this.swipeMove(0)
      }
    },
    startDrag(event) {
      if (this.data.disabled) {
        return
      }
      refs.filter(item => item !== this).forEach(item => item.closeOther())
      this.startOffset = this.offset
      this.resetTouchStatus()
      const { clientX, clientY } = event.touches[0]
      this.startX = clientX
      this.startY = clientY
    },
    onDrag(event) {
      if (this.data.disabled) {
        return
      }
      const { clientX, clientY } = event.touches[0]
      this.deltaX = clientX - this.startX
      this.deltaY = clientY - this.startY
      this.offsetX = Math.abs(this.deltaX)
      this.offsetY = Math.abs(this.deltaY)
      this.direction = this.direction || getDirection(this.offsetX, this.offsetY)

      if (this.direction !== 'horizontal') {
        return
      }
      this.dragging = true
      this.swipeMove(this.startOffset + this.deltaX)
    },
    endDrag() {
      if (this.data.disabled) {
        return
      }
      this.dragging = false
      this.swipeLeaveTransition()
    },
    onClick(event) {
      const { key } = event.currentTarget.dataset
      const position = key === undefined ? 'outside' : key
      this.triggerEvent('click', position)
      if (!this.offset) {
        return
      }
      if (this.data.asyncClose) {
        this.triggerEvent('close', {
          position: position,
          instance: this,
          name: this.data.name,
        })
      } else {
        this.swipeMove(0)
      }
    },
    resetTouchStatus() {
      this.direction = ''
      this.deltaX = 0
      this.deltaY = 0
      this.offsetX = 0
      this.offsetY = 0
    },
  },
})
