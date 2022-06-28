import { h } from '../../lib/guide-diy-vue.esm.js'

/**
 * @description 关于 props
 * 1. setup 会接收 props
 * 2. render 中可以通过 this 访问 props
 * 3. props 为 readonly，（shallowReadonly）
 */
export const Foo = {
  setup(props) {
    // props.count
    console.log(props)

    // 3. props 只读
    // readonly
    props.count++
  },
  render() {
    return h('div', {}, 'foo: ' + this.count)
  }
}
