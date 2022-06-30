import { createVNode } from '../vnode'

/**
 * 此处的 renderSlots 用于渲染插槽内容
 */
export function renderSlots(slots, name?, props?) {
  if (name) {
    const slot = slots[name]
    // console.log('slot', slot, slots)
    if (slot) {
      // 作用域插槽
      if (typeof slot === 'function') {
        return createVNode('div', {}, slot(props))
      } else {
        // 具名插槽
        return createVNode('div', {}, slot)
      }
    }
  } else {
    // 非具名插槽
    // console.log('noname')
    return createVNode('div', {}, slots)
  }
}
