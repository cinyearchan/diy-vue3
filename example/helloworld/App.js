import { h } from '../../lib/guide-diy-vue.esm.js'
window.self = null
export const App = {
  render() {
    window.self = this
    return h('div', {
      id: 'root',
      class: ['red', 'head']
    },
    // string
    // 'h1, vue'
    // array
    // [h('p', { class: 'red' }, 'h1'), h('p', { class: 'blue' }, 'vue')]
    // this
    'hi ' + this.msg
    )
  },
  setup() {
    return {
      msg: 'diy-vue'
    }
  }
}
