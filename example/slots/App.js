import { h } from '../../lib/guide-diy-vue.esm.js'
import { SlotFoo } from './SlotFoo.js'
import { NamedSlotFoo } from './NamedSlotFoo.js'
import { NamedScopedSlotFoo } from './NamedScopedSlotFoo.js'

export const App = {
  name: 'app',
  render() {
    const app = h('div', {}, 'App')
    const slotFoo = h(SlotFoo, {}, h('p', {}, '123'))
    const arraySlotFoo = h(SlotFoo, {}, [h('p', {}, '456'), h('p', {}, '789')])

    const namedSlotFoo = h(NamedSlotFoo, {}, {
      header: h('p', {}, 'header'),
      footer: h('p', {}, 'footer')
    })

    const namedScopedSlotFoo = h(NamedScopedSlotFoo, {}, {
      header: ({ age }) => h('p', {}, 'header age is ' + age),
      footer: () => h('p', {}, 'footer')
    })

    const namedScopedSlotFoo2 = h(NamedScopedSlotFoo, {}, {
      header: ({ age }) => h('p', {}, 'header with age ' + age),
      footer: h('p', {}, 'normal footer')
    })

    return h('div', {}, [
      app,
      slotFoo,
      arraySlotFoo,
      namedSlotFoo,
      namedScopedSlotFoo,
      namedScopedSlotFoo2
    ])
  },
  setup() {
    return {
      msg: 'diy-vue'
    }
  }
}
