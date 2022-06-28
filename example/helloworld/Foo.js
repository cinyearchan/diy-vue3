import { h } from '../../lib/guide-diy-vue.esm.js'

/**
 * @description 关于 props
 * 1. setup 会接收 props
 * 2. render 中可以通过 this 访问 props
 * 3. props 为 readonly，（shallowReadonly）
 */
export const Foo = {
  setup(props, { emit }) {
    // props.count
    console.log(props)

    // 3. props 只读
    // readonly
    // props.count++

    const emitAdd = () => {
      console.log('emit add')
      emit('add')
      emit('foo', 1, 2)
      emit('add-foo', 1, 2)
    }

    return {
      emitAdd
    }
  },
  render() {
    const btn = h(
      'button',
      {
        onClick: this.emitAdd
      },
      'emitAdd'
    )
    // return h('div', {}, 'foo: ' + this.count)
    const foo = h('p', {}, 'foo')
    return h('div', {}, [foo, btn])
  }
}
