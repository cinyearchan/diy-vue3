import { isObject } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, container) {
    // patch
    // 

    patch(vnode, container, null)
  }

  function patch(vnode, container, parentComponent = null) {
    // 处理组件

    // ShapeFlags 用于标注当前 vnode 是哪种类型的
    // vnode -> flag
    // string -> element
    // 判断是否是 element
    const { type, shapeFlag } = vnode

    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentComponent)
        break
      case Text:
        processText(vnode, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // TODO 处理 element
          processElement(vnode, container, parentComponent)
          // STATEFUL_COMPONENT
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件 component
          processComponent(vnode, container, parentComponent)
        }
        break
    }
  }

  function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode, container, parentComponent)
  }

  function processText(vnode: any, container: any) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(vnode, container, parentComponent) {
    // 处理 Element
    // 初始化
    mountElement(vnode, container, parentComponent)
  }

  function mountElement(vnode, container, parentComponent) {
    const el = (vnode.el = hostCreateElement(vnode.type)) // 不依赖平台实现，用稳定接口来替代

    // string array
    const { children, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text_children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 当 children 是数组时
      // array_children
      mountChildren(vnode, el, parentComponent)
    }

    // props
    const { props } = vnode
    for (const key in props) {
      const val = props[key]
      
      // const isOn = (key: string) => /^on[A-Z]/.test(key)
      // // 如果是 on 开头的注册事件 onClick onMousedown
      // if (isOn(key)) {
      //   const event = key.slice(2).toLocaleLowerCase()
      //   el.addEventListener(event, val)
      // } else { // 普通属性
      //   el.setAttribute(key, val)
      // }
      hostPatchProp(el, key, val) // 不依赖平台实现，用稳定接口替代
    }

    // container.append(el)
    hostInsert(el, container) // 不依赖平台实现，用稳定接口替代
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(child => {
      patch(child, container, parentComponent)
    })
  }

  function processComponent(vnode: any, container: any, parentComponent) {
    mountComponent(vnode, container, parentComponent)
  }

  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

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

    patch(subTree, container, instance)

    // element -> mount 再挂载 el
    initialVNode.el = subTree.el
  }

  return {
    createApp: createAppAPI(render)
  }
}
