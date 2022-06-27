import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch
  // 

  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件

  // 判断是否是 element
  // TODO 处理 element
  processElement(vnode, container)

  // 处理组件 component
  processComponent(vnode, container)
}

function processElement(vnode, container) {
  
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container)
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)
  setupRenderEffect(instance, container)
}


function setupRenderEffect(instance: any, container) {
  // 虚拟节点树
  const subTree = instance.render()

  // vnode -> patch 基于虚拟节点进行 patch
  // vnode -> element -> mountElement

  patch(subTree, container)
}

