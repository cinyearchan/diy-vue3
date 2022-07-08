import { effect } from '../reactivity'
import { isObject, EMPTY_OBJ } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {

  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options

  function render(vnode, container) {
    // patch
    // 

    patch(null, vnode, container, null, null)
  }

  /**
   * 
   * @param n1 旧的虚拟节点
   * @param n2 新的虚拟节点
   * @param container 
   * @param parentComponent 
   */
  function patch(n1, n2, container, parentComponent, anchor) {
    // 处理组件

    // ShapeFlags 用于标注当前 vnode 是哪种类型的
    // vnode -> flag
    // string -> element
    // 判断是否是 element
    const { type, shapeFlag } = n2

    // Fragment -> 只渲染 children
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break
      case Text:
        processText(n1, n2, container)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // TODO 处理 element
          processElement(n1, n2, container, parentComponent, anchor)
          // STATEFUL_COMPONENT
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          // 处理组件 component
          processComponent(n1, n2, container, parentComponent, anchor)
        }
        break
    }
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    // 处理 Element
    if (!n1) {
      // 初始化
      mountElement(n2, container, parentComponent, anchor)
    } else {
      // 更新
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
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
    patchChildren(n1, n2, el, parentComponent, anchor)
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

  /**
   * 双端对比 diff 算法更新子节点
   * @param n1 旧子节点
   * @param n2 新子节点
   * @param container 容器
   * @param parentComponent 父组件
   * @param anchor 锚点
   */
  function patchChildren(n1, n2, container, parentComponent, anchor) {
    const prevShapeFlag = n1.shapeFlag
    const shapeFlag = n2.shapeFlag
    const c1 = n1.children
    const c2 = n2.children

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新的是 text 老的是 array
        // 把老的 children 清空
        unmountChildren(n1.children)        
      }
      if (c1 !== c2) {
        // 设置 text
        hostSetElementText(container, c2)
      }
    } else {
      // 新的是 array
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { 
        // 老的是 text
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // 老的是 array
        // array diff array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
    // 循环变量，用于遍历子节点
    let i = 0
    
    let l2 = c2.length

    // c1 最后一个索引
    let e1 = c1.length - 1
    // c2 最后一个索引
    let e2 = l2 - 1

    function isSameVNodeType(n1, n2) {
      // type
      // key
      return n1.type === n1.type && n1.key === n2.key
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        // 一旦检索到不同的部分，立即跳出循环
        break
      }

      i++
    }

    // console.log(i)
    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        // 一旦检索到不同的部分，立即跳出循环
        break
      }

      e1--
      e2--
    }

    // 3. 新的比老的长 创建
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while (i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if (i > e2) { // 4. 老的比新的长 删除
      while (i <= e1) {
        hostRemove(c1[i].el)
        i++
      }
    } else {
      // 5. 中间对比
      let s1 = i
      let s2 = i

      // 记录新的节点的总数量
      const toBePatched = e2 - s2 + 1
      // 当前处理的数量
      let patched = 0
      const keyToNewIndexMap = new Map()
      const newIndexToOldIndexMap = new Array(toBePatched)
      let moved = false
      let maxNewIndexSoFar = 0

      for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

      for (let i = s2; i <= e2; i++) { // 遍历新节点，建立映射关系
        const nextChild = c2[i]
        keyToNewIndexMap.set(nextChild.key, i)
      }

      for (let i = s1; i <= e1; i++) { // 遍历老节点，查找不同部分
        const prevChild = c1[i]

        if (patched >= toBePatched) {
          hostRemove(prevChild.el)
          break
        }

        // 开始查找
        let newIndex
        if (prevChild.key != null) { // null undefined
          newIndex = keyToNewIndexMap.get(prevChild.key)
        } else {
          for (let j = s2; j < e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j

              break
            }
          }
        }

        if (newIndex === undefined) { // 说明这个节点在新的里面不存在，应该要删除
          hostRemove(prevChild.el)
        } else { // 这个节点在新的里面也存在，需要深层对比

          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1

          patch(prevChild, c2[newIndex], container, parentComponent, null)
          patched++
        }
      }

      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
      let j = increasingNewIndexSequence.length - 1

      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2
        const nextChild = c2[nextIndex]
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null
        if (newIndexToOldIndexMap[i] === 0) { // 5.3 创建
          patch(null, nextChild, container, parentComponent, anchor)
        } else if (moved) { // 5.2 移动
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            console.log('移动位置')
            hostInsert(nextChild.el, container, anchor)
          } else {
            j--
          }
        }        
      }
    }
  }

  function unmountChildren(children) {
    for (let i = 0; i < children.length; i++) {
      const el = children[i].el
      // remove
      hostRemove(el)
    }
  }

  function mountElement(n2, container, parentComponent, anchor) {
    const el = (n2.el = hostCreateElement(n2.type)) // 不依赖平台实现，用稳定接口来替代

    // string array
    const { children, shapeFlag } = n2

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text_children
      el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      // 当 children 是数组时
      // array_children
      mountChildren(n2.children, el, parentComponent, anchor)
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
    hostInsert(el, container, anchor) // 不依赖平台实现，用稳定接口替代
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(child => {
      patch(null, child, container, parentComponent, anchor)
    })
  }

  function processComponent(n1: any, n2: any, container: any, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function mountComponent(initialVNode: any, container, parentComponent, anchor) {
    const instance = createComponentInstance(initialVNode, parentComponent)

    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container, anchor)
  }


  function setupRenderEffect(instance: any, initialVNode, container, anchor) {
    effect(() => {
      if (!instance.isMounted) {
        console.log('init')
        // 获取代理对象
        const { proxy } = instance

        // 虚拟节点树，同时通过 instance.subTree 暂存本次生成的节点树
        const subTree = (instance.subTree = instance.render.call(proxy))

        // vnode -> patch 基于虚拟节点进行 patch
        // vnode -> element -> mountElement

        patch(null, subTree, container, instance, anchor)

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

        patch(prevSubTree, subTree, container, instance, anchor)

      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }
}

function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = (u + v) >> 1
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}
