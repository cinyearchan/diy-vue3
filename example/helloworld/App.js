import { h } from '../../lib/guide-diy-vue.esm.js'

export const App = {
  render() {
    return h('div', {
      id: 'root',
      class: ['red', 'head']
    },
    // string
    // 'h1, vue'
    // array
    [h('p', { class: 'red' }, 'h1'), h('p', { class: 'blue' }, 'vue')]
    )
  },
  setup() {
    return {
      msg: 'diy-vue'
    }
  }
}
