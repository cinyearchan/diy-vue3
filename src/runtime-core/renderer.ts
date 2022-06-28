import { isObject } from '../shared'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch
  // 

  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件

  // 判断是否是 element
  if (typeof vnode.type === 'string') {
    // TODO 处理 element
    processElement(vnode, container)
  } else if (isObject(vnode.type)) {
    // 处理组件 component
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  // 处理 Element
  // 初始化
  mountElement(vnode, container)
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.type)

  // string array
  const { children } = vnode

  if (typeof children === 'string') {
    el.textContent = children
  } else {
    // 当 children 是数组时
    mountChildren(vnode, el)
  }

  // props
  const { props } = vnode
  for (const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  container.append(el)
}

function mountChildren(vnode, container) {
  vnode.children.forEach(child => {
    patch(child, container)
  })
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
  // 获取代理对象
  const { proxy } = instance

  // 虚拟节点树
  const subTree = instance.render.call(proxy)

  // vnode -> patch 基于虚拟节点进行 patch
  // vnode -> element -> mountElement

  patch(subTree, container)
}

