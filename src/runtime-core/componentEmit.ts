import { camelize, toHandlerkey } from '../shared'

export function emit(instance, event, ...args) {
  console.log('emit event', event)

  // instance.props -> event
  // emit 实际绑定的第一个参数是 component 在 component.ts 中
  const { props } = instance

  // TPP
  // 先写一个特定的行为 -> 重构成通用的行为
  // 例如 add
  // const handler = props['onAdd']
  // handler && handler()
  
  const handlerName = toHandlerkey(camelize(event))
  const handler = props[handlerName]
  handler && handler(...args)
}
