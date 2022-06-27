function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children
    };
    return vnode;
}

const isObject = (val) => {
    return val !== null && typeof val === 'object';
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStatefulComponent(instance); // 创建有状态的组件
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    const { setup } = Component;
    if (setup) {
        // 两个情况，返回 function 或 object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function or object
    // TODO function
    // object
    if (typeof setupResult === 'object') {
        instance.setState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // patch
    // 
    patch(vnode, container);
}
function patch(vnode, container) {
    // 处理组件
    // 判断是否是 element
    if (typeof vnode.type === 'string') {
        // TODO 处理 element
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 处理组件 component
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 处理 Element
    // 初始化
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const el = document.createElement(vnode.type);
    // string array
    const { children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else {
        // 当 children 是数组时
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(child => {
        patch(child, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    // 虚拟节点树
    const subTree = instance.render();
    // vnode -> patch 基于虚拟节点进行 patch
    // vnode -> element -> mountElement
    patch(subTree, container);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先转换成虚拟节点
            // 后续所有的逻辑，都基于虚拟节点 vnode 进行操作
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

export { createApp, h };
