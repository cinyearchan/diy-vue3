import { createRenderer } from '../runtime-core'

function createElement(type) {
  return document.createElement(type)
}

function patchProp(el, key, val) {
  const isOn = (key: string) => /^on[A-Z]/.test(key)
  
  // 如果是 on 开头的注册事件 onClick onMousedown
  if (isOn(key)) {
    const event = key.slice(2).toLocaleLowerCase()
    el.addEventListener(event, val)
  } else { // 普通属性
    el.setAttribute(key, val)
  }
}

function insert(el, container) {
  container.append(el)
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert
})

export function createApp(...args) {
  return renderer.createApp(...args)
}

export * from '../runtime-core'
