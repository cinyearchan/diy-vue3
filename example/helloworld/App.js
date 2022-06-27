export const App = {
  render(h) {
    return h('div', '', 'h1, ' + this.msg)
  },
  setup() {
    return {
      msg: 'diy-vue'
    }
  }
}
