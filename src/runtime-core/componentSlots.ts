import { ShapeFlags } from '../shared/ShapeFlags'
import { VNode } from './vnode'

export function initSlots(instance, children) {
  // 判断是否需要处理 slot 、是否有具名插槽、是否有作用域插槽
  const { vnode } = instance
  // if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
  //   normalizeSlots(children, instance)
  // }
  normalizeSlots(children, instance)
}

function normalizeSlots(children: any, instance: any) {
  let slots = {}
  if (Array.isArray(children)) {
    slots = children
  } else {
    if (children instanceof VNode) {
      slots = normalizeSlotValue(children)
    } else {
      for (const key in children) {
        const value = children[key]
        // slot
        slots[key] = typeof value === 'function' ? (props) => normalizeSlotValue(value(props)) : normalizeSlotValue(value)
      }
    }
  }

  instance.slots = slots
}

function normalizeSlotValue(value) {
  return Array.isArray(value) ? value : [value]
}
