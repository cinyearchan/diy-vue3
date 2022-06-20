import { openBlock, createElementBlock } from 'vue';

var script = {
  setup() {
    return {}
  }
};

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, "app"))
}

script.render = render;
script.__file = "App.vue";

export { script as default };
