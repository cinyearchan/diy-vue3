import { createVNode } from './vnode'
import { render } from './renderer'

export function createApp(rootComponent) {
  return {
    mount(rootContainer){
      // 先转换成虚拟节点
      // 后续所有的逻辑，都基于虚拟节点 vnode 进行操作
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}
