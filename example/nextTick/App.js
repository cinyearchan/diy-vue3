import { h, ref, getCurrentInstance, nextTick } from '../../lib/guide-diy-vue.esm.js'

export default {
  name: 'App',
  setup() {
    const count = ref(1)
    const instance = getCurrentInstance()

    function onClick() {
      for (let i = 0; i < 100; i++) {
        console.log('update')
        count.value = i
      }
      
      console.log(instance) // 这里不是最新的
      nextTick(() => {
        console.log(instance) // 这是是最新的
      })

      // 或者
      // await nextTick()
      // console.log(instance) // 这里是最新的
    }

    return {
      onClick,
      count
    }
  },
  render() {
    const button = h('button', {
      onClick: this.onClick
    }, 'update')
    const p = h('p', {}, 'count: ' + this.count)

    return h('div', {}, [button, p])
  }
}
