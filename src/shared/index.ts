export const extend = Object.assign

export const isObject = (val) => {
  return val !== null && typeof val === 'object'
}

export const hasChanged = (val, oldVal) => {
  return !Object.is(val, oldVal)
}

export const hasOwn = (obj, key) => {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

/**
   * 首字母大写
   * @param str 
   * @returns 返回首字母大写的字符串
   * @description add -> Add
   */
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 短横线连接的字符串转为驼峰命名
 * @param str 
 * @returns 
 */
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : ''
  })
}

export const toHandlerkey = (str: string) => {
  return str ? 'on' + capitalize(str) : ''
}
