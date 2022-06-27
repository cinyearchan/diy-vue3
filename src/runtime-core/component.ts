export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type
  }

  return component
}

export function setupComponent(instance) {
  // TODO
  // initProps()
  // initSlots()

  setupStatefulComponent(instance) // 创建有状态的组件
}

function setupStatefulComponent(instance: any) {
  const Component = instance.type

  const { setup } = Component

  if (setup) {
    // 两个情况，返回 function 或 object
    const setupResult = setup()

    handleSetupResult(instance, setupResult)
  }
}

function handleSetupResult(instance, setupResult: any) {
  // function or object

  // TODO function

  // object
  if (typeof setupResult === 'object') {
    instance.setState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  const Component = instance.type

  if (Component.render) {
    instance.render = Component.render
  }
}
