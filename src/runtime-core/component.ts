import { shallowReadonly } from '../reactivity/reactive'
import { initProps } from './componentProps'
import { initSlots } from './componentSlots'
import { emit } from './componentEmit'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'

let currentInstance = null

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    emit: () => {}
  }

  component.emit = emit.bind(null, component) as any

  return component
}

export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props)
  initSlots(instance, instance.vnode.children)

  setupStatefulComponent(instance) // 创建有状态的组件
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type

  // ctx
  instance.proxy = new Proxy({_: instance}, PublicInstanceProxyHandlers)

  const { setup } = Component

  if (setup) {
    // 保存当前实例
    setCurrentInstance(instance)

    // 两个情况，返回 function 或 object
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    
    // 移除全局变量中保存的当前实例
    setCurrentInstance(null)

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function or object

  // TODO function

  // object
  if (typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  if (Component.render) {
    instance.render = Component.render
  }
}

export function getCurrentInstance() {
  return currentInstance
}

export function setCurrentInstance(instance) {
  currentInstance = instance
}
