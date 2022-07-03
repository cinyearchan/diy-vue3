import { getCurrentInstance } from './component'

export function provide(key, value) {
  // 存
  // key value
  // provide 必须在 setup 函数中使用，因为 getCurrentInstance 只有在 setup 才能获取到当前实例
  const currentInstance: any = getCurrentInstance()
  
  // 必须限定 provide 在 setup 函数中使用
  if (currentInstance) {
    let { provides } = currentInstance

    const parentProvides = currentInstance.parent.provides

    // 初始化操作应该只执行一次
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }

    provides[key] = value
  }
}

export function inject(key, defaultValue) {
  // 取
  const currentInstance: any = getCurrentInstance()

  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides

    if (key in parentProvides) {
      return parentProvides[key]
    } else if (defaultValue) {
      if (typeof defaultValue === 'function') {
        return defaultValue()
      }
      return defaultValue
    }
  }
}
