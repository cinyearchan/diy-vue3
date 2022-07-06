import { effect } from '../reactivity'
import { isObject, EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {

  const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

  function render(vnode, container) {
    // patch
    // 

    patch(null, vnode, container, null)
  }

  /**
   * 
   * @param n1 旧的虚拟节点
   * @param n2 新的虚拟节点
   * @param container 
   * @param parentComponent 
   */
  function patch(n1, n2, container, parentComponent) {
    // 处理组件

    // ShapeFlags 用于标注当前 vnode 是哪种类型的
    // vnode -> flag
    // string -> element
    // 判断是否是 element
    const { type, shapeFlag } = n2

    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // TODO 处理 element
          processElement(n1, n2, container, parentComponent)
          // STATEFUL_COMPONENT
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件 component
          processComponent(n1, n2, container, parentComponent)
        }
        break
    }
  }

  function processFragment(n1, n2, container, parentComponent) {
    mountChildren(n2, container, parentComponent)
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(n1, n2, container, parentComponent) {
    // 处理 Element
    if (!n1) {
      // 初始化
      mountElement(n2, container, parentComponent)
    } else {
      // 更新
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log('patchElement')
    console.log('n1', n1)
    console.log('n2', n2)

    // TODO
    // 更新 props
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)

    patchProps(el, oldProps, newProps)
    // 更新 children
  }

  function patchProps(el, oldProps, newProps) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
  
        if (prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }

      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  function mountElement(n2, container, parentComponent) {
    const el = (n2.el = hostCreateElement(n2.type)) // 不依赖平台实现，用稳定接口来替代

    // string array
    const { children, shapeFlag } = n2

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text_children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 当 children 是数组时
      // array_children
      mountChildren(n2, el, parentComponent)
    }

    // props
    const { props } = n2
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
      hostPatchProp(el, key, null, val) // 不依赖平台实现，用稳定接口替代
    }

    // container.append(el)
    hostInsert(el, container) // 不依赖平台实现，用稳定接口替代
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(child => {
      patch(null, child, container, parentComponent)
    })
  }

  function processComponent(n1: any, n2: any, container: any, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initialVNode: any, container, parentComponent) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
  }


  function setupRenderEffect(instance: any, initialVNode, container) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init')
        // 获取代理对象
        const { proxy } = instance

        // 虚拟节点树，同时通过 instance.subTree 暂存本次生成的节点树
        const subTree = (instance.subTree = instance.render.call(proxy))

        // vnode -> patch 基于虚拟节点进行 patch
        // vnode -> element -> mountElement

        patch(null, subTree, container, instance)

        // element -> mount 再挂载 el
        initialVNode.el = subTree.el
        
        instance.isMounted = true
      } else {
        console.log('update')
        
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree

        instance.subTree = subTree

        // console.log('current', subTree)
        // console.log('prev', prevSubTree)

        patch(prevSubTree, subTree, container, instance)

      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}
