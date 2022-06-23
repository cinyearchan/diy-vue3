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
