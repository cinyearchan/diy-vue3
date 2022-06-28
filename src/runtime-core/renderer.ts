import { isObject } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
  // patch
  // 

  patch(vnode, container)
}

function patch(vnode, container) {
  // 处理组件

  // ShapeFlags 用于标注当前 vnode 是哪种类型的
  // vnode -> flag
  // string -> element
  // 判断是否是 element
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    // TODO 处理 element
    processElement(vnode, container)
    // STATEFUL_COMPONENT
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
  const el = (vnode.el = document.createElement(vnode.type))

  // string array
  const { children, shapeFlag } = vnode

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    // 当 children 是数组时
    // array_children
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

function mountComponent(initialVNode: any, container) {
  const instance = createComponentInstance(initialVNode)

  setupComponent(instance)
  setupRenderEffect(instance, initialVNode, container)
}


function setupRenderEffect(instance: any, initialVNode, container) {
  // 获取代理对象
  const { proxy } = instance

  // 虚拟节点树
  const subTree = instance.render.call(proxy)

  // vnode -> patch 基于虚拟节点进行 patch
  // vnode -> element -> mountElement

  patch(subTree, container)

  // element -> mount 再挂载 el
  initialVNode.el = subTree.el
}

