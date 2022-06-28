import { h } from '../../lib/guide-diy-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
  render() {
    window.self = this
    return h('div', {
      id: 'root',
      class: ['red', 'head'],
      onClick() {
        console.log('click')
      }
    },
    // string
    // 'h1, vue'
    // array
    // [h('p', { class: 'red' }, 'h1'), h('p', { class: 'blue' }, 'vue')]
    // this
    // 'hi ' + this.msg
    [
      h('div', {}, 'hi, ' + this.msg),
      h(Foo, {
        count: 1,
        // on + Event
        onAdd() {
          console.log('onAdd')
        },
        onFoo(a, b) {
          console.log('onFoo', a, b)
        },
        onAddFoo(a, b) {
          console.log('onAddFoo', a, b)
        }
      })
    ]
    )
  },
  setup() {
    return {
      msg: 'diy-vue'
    }
  }
}
