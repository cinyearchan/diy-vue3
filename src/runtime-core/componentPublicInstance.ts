import { hasOwn } from '../shared'

const publicPropertiesMap = {
  $el: i => i.vnode.el,
  // $slots
  $slots: i => i.slots,
  $props: i => i.props,
}

export const PublicInstanceProxyHandlers = {
  get({_: instance}, key) {
    // setupState
    const { setupState, props } = instance
    // if (key in setupState) {
    //   return setupState[key]
    // }

    if (hasOwn(setupState, key)) {
      return setupState[key]
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    // key -> $el
    // if (key === '$el') {
    //   return instance.vnode.el
    // }
    const publicGetter = publicPropertiesMap[key]
    if (publicGetter) {
      return publicGetter(instance)
    }

    // 因为 vue3 中 setup 和 options data 写法都支持
    // $data
  }
}
