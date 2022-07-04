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
const hasChanged = (val, oldVal) => {
    return !Object.is(val, oldVal);
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

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        // 1. 会收集依赖
        // shouldTrack 作区分
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // reset
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    // 如果 dep 中已经存在 activeEffect 就不需要重复收集依赖
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
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
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function stop(runner) {
    runner.effect.stop();
}

class ComputedRefImpl {
    constructor(getter) {
        this._dirty = true;
        this._getter = getter;
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        });
    }
    get value() {
        // 当依赖的响应式对象说的值发生改变的时候，_dirty 的值应该变为 true
        if (this._dirty) {
            this._dirty = false;
            this._value = this._effect.run();
        }
        return this._value;
    }
}
function computed(getter) {
    return new ComputedRefImpl(getter);
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
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
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
function isReactive(value) {
    return !!value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */];
}
function isReadonly(value) {
    return !!value["__v_isReadonly" /* ReactiveFlags.IS_READONLY */];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        // 判断 value 是不是对象，如果是对象，要将其转换为 reactive
        this._value = convert(value);
        // 同时将转换之前的 value 保存起来，以便用于对比
        this._rawValue = value;
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 一定是先修改了 value 再通知依赖修改了
        // 判断前后两个值是否相等
        if (hasChanged(newValue, this._rawValue)) {
            this._value = convert(newValue);
            this._rawValue = newValue;
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // get 时，如果是 ref 就返回 .value
            // 如果不是 ref，就返回值本身
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // set 时，遇到 ref，赋值不是 ref，修改 .value
            target[key];
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else { // 遇到 ref，赋值是 ref，直接替换
                return Reflect.set(target, key, value);
            }
        }
    });
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
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRefs(setupResult);
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
        patch(null, vnode, container, null);
    }
    /**
     *
     * @param n1 旧的虚拟节点
     * @param n2 新的虚拟节点
     * @param container
     * @param parentComponent
     */
    function patch(n1, n2, container, parentComponent) {
        // 处理组件
        // ShapeFlags 用于标注当前 vnode 是哪种类型的
        // vnode -> flag
        // string -> element
        // 判断是否是 element
        const { type, shapeFlag } = n2;
        // Fragment -> 只渲染 children
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // TODO 处理 element
                    processElement(n1, n2, container, parentComponent);
                    // STATEFUL_COMPONENT
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 处理组件 component
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processElement(n1, n2, container, parentComponent) {
        // 处理 Element
        if (!n1) {
            // 初始化
            mountElement(n2, container, parentComponent);
        }
        else {
            // 更新
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log('patchElement');
        console.log('n1', n1);
        console.log('n2', n2);
        // TODO
        // 更新 props
        // 更新 children
    }
    function mountElement(n2, container, parentComponent) {
        const el = (n2.el = hostCreateElement(n2.type)); // 不依赖平台实现，用稳定接口来替代
        // string array
        const { children, shapeFlag } = n2;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            // text_children
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            // 当 children 是数组时
            // array_children
            mountChildren(n2, el, parentComponent);
        }
        // props
        const { props } = n2;
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
            patch(null, child, container, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log('init');
                // 获取代理对象
                const { proxy } = instance;
                // 虚拟节点树，同时通过 instance.subTree 暂存本次生成的节点树
                const subTree = (instance.subTree = instance.render.call(proxy));
                // vnode -> patch 基于虚拟节点进行 patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance);
                // element -> mount 再挂载 el
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('update');
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                // console.log('current', subTree)
                // console.log('prev', prevSubTree)
                patch(prevSubTree, subTree, container, instance);
            }
        });
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

exports.ReactiveEffect = ReactiveEffect;
exports.computed = computed;
exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.effect = effect;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.isTracking = isTracking;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.renderSlots = renderSlots;
exports.shallowReadonly = shallowReadonly;
exports.stop = stop;
exports.track = track;
exports.trackEffects = trackEffects;
exports.trigger = trigger;
exports.triggerEffects = triggerEffects;
exports.unRef = unRef;
