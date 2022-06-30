import { h, renderSlots } from '../../lib/guide-diy-vue.esm.js'

export const NamedSlotFoo = {
  setup() {
    return {}
  },
  render() {
    const foo = h('p', {}, 'named-slot-foo')
    // console.log(this.$slots)
    // SlotFoo .vnode .children => 将 this.$slots 添加到 children 的位置
    // return h('div', {}, [foo, renderSlots(this.$slots)])

    // 渲染元素到指定位置 slot   具名插槽
    // 1. 获取要渲染的元素
    // 2. 获取要渲染的位置

    // 作用域插槽
    return h('div', {}, [
      renderSlots(this.$slots, 'header'),
      foo,
      renderSlots(this.$slots, 'footer')
    ])
  }
}
