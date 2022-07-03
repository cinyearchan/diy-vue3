// 组件 provide 和 inject 功能
import { h, provide, inject } from '../../lib/guide-diy-vue.esm.js'

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal'),
    provide('bar', 'barVal')
  },
  render() {
    return h('div', {}, [
      h('p', {}, 'Provider'),
      h(ProviderTwo)
    ])
  }
}

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooTwo')
    const foo = inject('foo')

    return {
      foo
    }
  },
  render() {
    return h('div', {}, [h('p', {}, `ProviderTwo foo: ${this.foo}`), h(Consumer)])
  }
}

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo')
    const bar = inject('bar')
    const baz = inject('baz', 'defaultBaz') // baz 获取不到值时使用默认值
    const fnFar = inject('fnFar', () => 'fnFar')

    return {
      foo,
      bar,
      baz,
      fnFar,
    }
  },

  render() {
    return h('div', {}, `Consumer: - ${this.foo} - ${this.bar} - ${this.baz} - ${this.fnFar}`)
  }
}

export const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [
      h('p', {}, 'apiInject'),
      h(Provider)
    ])
  }
}
