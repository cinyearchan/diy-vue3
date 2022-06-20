# mini-vue



## vue3 结构

```mermaid
graph LR
	A[vue] --> B["#64;vue/compiler-dom"];
	B["#64;vue/compiler-dom"] --> C["#64;vue/compiler-core"];
	D["#64;vue/compiler-sfc"] --> B["#64;vue/compiler-dom"];
	D["#64;vue/compiler-sfc"] --> C["#64;vue/compiler-core"];
	A[vue] --> E["#64;vue/runtime-dom"];
	E["#64;vue/runtime-dom"] --> F["#64;vue/runtime-core"];
	F["#64;vue/runtime-core"] --> G["#64;vue/reactivity"];
```

- 处理编译
  - `@vue/compiler-sfc`  将单文件组件编译成 js
  - `@vue/compiler-dom`  依赖 `compiler-core`，用于处理 template，将其转换为 render 函数
  - `@vue/compiler-core`  
- 处理运行时
  - `@vue/runtime-dom`  专门处理 dom 节点上的东西
  - `@vue/runtime-core`  核心运行时
  - `@vue/reactivity`  实现响应式





