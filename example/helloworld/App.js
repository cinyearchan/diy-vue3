import { h } from '../../lib/guide-diy-vue.esm.js'

export const App = {
  render() {
    return h('div', '', 'h1, ' + this.msg)
  },
  setup() {
    return {
      msg: 'diy-vue'
    }
  }
}
