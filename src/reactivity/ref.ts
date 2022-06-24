import { hasChanged, isObject } from '../shared'
import { isTracking, trackEffects, triggerEffects } from './effect'
import { reactive } from './reactive'

class RefImpl {
  private _value: any
  public dep
  private _rawValue: any
  public __v_isRef = true
  constructor(value) {
    // 判断 value 是不是对象，如果是对象，要将其转换为 reactive
    this._value = convert(value)
    // 同时将转换之前的 value 保存起来，以便用于对比
    this._rawValue = value
    this.dep = new Set()
  }
  
  get value() {
    trackRefValue(this)
    
    return this._value
  }

  set value(newValue) {
    // 一定是先修改了 value 再通知依赖修改了

    // 判断前后两个值是否相等
    if (hasChanged(newValue, this._rawValue)) {
      this._value = convert(newValue)
      this._rawValue = newValue
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

function trackRefValue(ref) {
  if(isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref) {
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // get 时，如果是 ref 就返回 .value
      // 如果不是 ref，就返回值本身
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // set 时，遇到 ref，赋值不是 ref，修改 .value
      const oldValue = target[key]
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else { // 遇到 ref，赋值是 ref，直接替换
        return Reflect.set(target, key, value)
      }
    }
  })
}
