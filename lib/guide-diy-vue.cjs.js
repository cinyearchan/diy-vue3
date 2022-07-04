'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class VNode {
    constructor(type, props, children) {
        this.el = null;
        this.type = type;
        this.props = props;
        this.children = children;
        this.shapeFlag = getShapeFlag(type);
    }
}
const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    // const vnode = {
    //   type,
    //   props,
    //   children,
    //   shapeFlag: getShapeFlag(type),
    //   el: null
    // }
    const vnode = new VNode(type, props, children);
    // 为 children 标注类型
    if (typeof children === 'string') {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        // console.log('children isArray', vnode)
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // 标注 children 类型 slot
    // 组件类型 + children === object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        // 1. 普通插槽 与 children 为对象、数组的 同属一类
        // 2. 具名插槽 NAMED_SLOT_CHILDREN 和 // 3. 作用域插槽 SCOPED_SLOT_CHILDREN 同属一类 ADVANCED_SLOT_CHILDREN => 统称 SLOT_CHILDREN
        // console.log('children', children)
        // console.log(children instanceof VNode)
        if (typeof children === 'object') {
            if (Array.isArray(children) || children instanceof VNode) ;
            else {
                vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
            }
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ShapeFlags.ELEMENT */ : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

/**
 * 此处的 renderSlots 用于渲染插槽内容
 */
function renderSlots(slots, name, props) {
    if (name) {
        const slot = slots[name];
        // console.log('slot', slot, slots)
        if (slot) {
            // 作用域插槽
            if (typeof slot === 'function') {
                return createVNode(Fragment, {}, slot(props));
            }
            else {
                // 具名插槽
                return createVNode(Fragment, {}, slot);
            }
        }
    }
    else {
        // 非具名插槽
        // console.log('noname')
        return createVNode(Fragment, {}, slots);
    }
}

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === 'object';
};
const hasOwn = (obj, key) => {
    return Object.prototype.hasOwnProperty.call(obj, key);
};
/**
   * 首字母大写
   * @param str
   * @returns 返回首字母大写的字符串
   * @description add -> Add
   */
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
/**
 * 短横线连接的字符串转为驼峰命名
 * @param str
 * @returns
 */
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : '';
    });
};
const toHandlerkey = (str) => {
    return str ? 'on' + capitalize(str) : '';
};

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 判断 res 是不是 Object
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set fail because target is readonly`);
        return true;
    }
};
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} must be an object`);
        return target;
    }
    else {
        return new Proxy(target, baseHandlers);
    }
}
function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // TODO
    // attrs
}

function initSlots(instance, children) {
    // if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) { // 这个判断基本可以省略，被下方的判断替代了
    //   normalizeSlots(children, instance)
    // }
    normalizeSlots(children, instance);
}
function normalizeSlots(children, instance) {
    let slots = {};
    if (Array.isArray(children)) {
        slots = children;
    }
    else {
        if (children instanceof VNode) {
            slots = normalizeSlotValue(children);
        }
        else {
            for (const key in children) {
                const value = children[key];
                // slot
                slots[key] = typeof value === 'function' ? (props) => normalizeSlotValue(value(props)) : normalizeSlotValue(value);
            }
        }
    }
    instance.slots = slots;
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function emit(instance, event, ...args) {
    console.log('emit event', event);
    // instance.props -> event
    // emit 实际绑定的第一个参数是 component 在 component.ts 中
    const { props } = instance;
    // TPP
    // 先写一个特定的行为 -> 重构成通用的行为
    // 例如 add
    // const handler = props['onAdd']
    // handler && handler()
    const handlerName = toHandlerkey(camelize(event));
    const handler = props[handlerName];
    handler && handler(...args);
}

const publicPropertiesMap = {
    $el: i => i.vnode.el,
    // $slots
    $slots: i => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // setupState
        const { setupState, props } = instance;
        // if (key in setupState) {
        //   return setupState[key]
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // key -> $el
        // if (key === '$el') {
        //   return instance.vnode.el
        // }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // 因为 vue3 中 setup 和 options data 写法都支持
        // $data
    }
};

let currentInstance = null;
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent: parent ? parent : {},
        emit: () => { }
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance); // 创建有状态的组件
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // 保存当前实例
        setCurrentInstance(instance);
        // 两个情况，返回 function 或 object
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit
        });
        // 移除全局变量中保存的当前实例
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function or object
    // TODO function
    // object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    // 存
    // key value
    // provide 必须在 setup 函数中使用，因为 getCurrentInstance 只有在 setup 才能获取到当前实例
    const currentInstance = getCurrentInstance();
    // 必须限定 provide 在 setup 函数中使用
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        // 初始化操作应该只执行一次
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先转换成虚拟节点
                // 后续所有的逻辑，都基于虚拟节点 vnode 进行操作
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options;
    function render(vnode, container) {
        // patch
        // 
        patch(vnode, container, null);
    }
    function patch(vnode, container, parentComponent = null) {
        // 处理组件
        // ShapeFlags 用于标注当前 vnode 是哪种类型的
        // vnode -> flag
        // string -> element
        // 判断是否是 element
        const { type, shapeFlag } = vnode;
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // TODO 处理 element
                    processElement(vnode, container, parentComponent);
                    // STATEFUL_COMPONENT
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理组件 component
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    function processText(vnode, container) {
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processElement(vnode, container, parentComponent) {
        // 处理 Element
        // 初始化
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        const el = (vnode.el = hostCreateElement(vnode.type)); // 不依赖平台实现，用稳定接口来替代
        // string array
        const { children, shapeFlag } = vnode;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // text_children
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 当 children 是数组时
            // array_children
            mountChildren(vnode, el, parentComponent);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            // const isOn = (key: string) => /^on[A-Z]/.test(key)
            // // 如果是 on 开头的注册事件 onClick onMousedown
            // if (isOn(key)) {
            //   const event = key.slice(2).toLocaleLowerCase()
            //   el.addEventListener(event, val)
            // } else { // 普通属性
            //   el.setAttribute(key, val)
            // }
            hostPatchProp(el, key, val); // 不依赖平台实现，用稳定接口替代
        }
        // container.append(el)
        hostInsert(el, container); // 不依赖平台实现，用稳定接口替代
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(child => {
            patch(child, container, parentComponent);
        });
    }
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        // 获取代理对象
        const { proxy } = instance;
        // 虚拟节点树
        const subTree = instance.render.call(proxy);
        // vnode -> patch 基于虚拟节点进行 patch
        // vnode -> element -> mountElement
        patch(subTree, container, instance);
        // element -> mount 再挂载 el
        initialVNode.el = subTree.el;
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    // 如果是 on 开头的注册事件 onClick onMousedown
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase();
        el.addEventListener(event, val);
    }
    else { // 普通属性
        el.setAttribute(key, val);
    }
}
function insert(el, container) {
    container.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
