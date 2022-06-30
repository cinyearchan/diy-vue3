import { hasOwn } from '../shared'
import { ShapeFlags } from '../shared/ShapeFlags'

export class VNode {
  public type
  public props
  public children
  public shapeFlag
  public el = null
  constructor(type, props?, children?) {
    this.type = type
    this.props = props
    this.children = children
    this.shapeFlag = getShapeFlag(type)
  }
}

export function createVNode(type, props?, children?) {
  // const vnode = {
  //   type,
  //   props,
  //   children,
  //   shapeFlag: getShapeFlag(type),
  //   el: null
  // }

  const vnode = new VNode(type, props, children)
  
  // 为 children 标注类型
  if (typeof children === 'string') {
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.TEXT_CHILDREN
  } else if (Array.isArray(children)) {
    // console.log('children isArray', vnode)
    vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.ARRAY_CHILDREN
  }

  // 标注 children 类型 slot
  // 组件类型 + children === object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // 1. 普通插槽 与 children 为对象、数组的 同属一类
    // 2. 具名插槽 NAMED_SLOT_CHILDREN 和 // 3. 作用域插槽 SCOPED_SLOT_CHILDREN 同属一类 ADVANCED_SLOT_CHILDREN => 统称 SLOT_CHILDREN

    // console.log('children', children)
    // console.log(children instanceof VNode)
    if (typeof children === 'object') {
      if (Array.isArray(children) || children instanceof VNode) {
        // children 是数组
        // children 是 单个的 vnode
      } else {
        vnode.shapeFlag = vnode.shapeFlag | ShapeFlags.SLOT_CHILDREN
      }
    }
  }

  return vnode
}

function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}
