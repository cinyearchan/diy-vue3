import { h, renderSlots } from '../../lib/guide-diy-vue.esm.js'

export const SlotFoo = {
  setup() {
    return {}
  },
  render() {
    const slotFoo = h('p', {}, 'slot-foo')
    // console.log('this.$slots', this.$slots)
    // SlotFoo .vnode .children => 将 this.$slots 添加到 children 的位置
    return h('div', {}, [slotFoo, renderSlots(this.$slots)])
  }
}
