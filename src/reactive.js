/**
 * 响应式系统
 * 封装一个核心类Dep和watchEffect(), getDep(), reactive()核心函数
 */
// 发布者-订阅者模型
class Dep {
  constructor() {
    this.subscribers = new Set()
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }
}

let activeEffect = null
/**
 * 核心函数一 执行一次effect函数, 收集依赖
 * @param effect 需要被收集依赖的函数
 */
function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

const targetMap = new WeakMap()
/**
 * 核心函数二 从targetMap中找到 某一个对象的某一个属性的dep对象
 * @param target 目标对象
 * @param key 目标对象的key
 * @return {Dep} 目标dep对象
 */
const getDep = (target, key) => {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

/**
 * 核心函数三 将目标对象修饰成响应式对象(修改访问控制器)
 * @param raw 目标对象
 * @return {*}
 */
const reactive = (raw) => {
  Object.keys(raw).forEach(key => {
    const dep = getDep(raw, key)
    let value = raw[key]
    Object.defineProperty(raw, key, {
      get() {
        dep.depend()
        return value
      },
      set(newValue) {
        value = newValue
        dep.notify()
      }
    })
  })
  return raw
}

/**
 * 下面为演示代码
 * @type {*}
 */

const info = reactive({
  name: 'fxc',
  height: 100
})
const foo = reactive({
  age: 200
})

watchEffect(function() {
  console.log('effect-1', info.height)
})

watchEffect(function() {
  console.log('effect-2', info.height + 100)
})

watchEffect(function() {
  console.log('effect-3', info.name)
})
watchEffect(function() {
  console.log('effect-4', foo.age)
})

foo.age++
