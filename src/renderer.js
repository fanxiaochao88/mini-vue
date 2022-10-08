/**
 * 渲染器模块
 * 包含: h() mount() patch()
 */
/**
 * h函数生成虚拟节点
 * @param {Element} tag 标签名称
 * @param {Options} props 标签属性
 * @param {String|h} children 子节点
 *
 * @return {{children, tag, props}} 虚拟节点或虚拟节点树
 */
// eslint-disable-next-line no-unused-vars
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

/**
 * 将虚拟节点挂载到指定的容器上
 * @param vnode 虚拟节点
 * @param container 指定的容器
 */
// eslint-disable-next-line no-unused-vars
const mount = (vnode, container) => {
  // 1.创建原生dom, 并且在vnode添加el
  const el = vnode.el = document.createElement(vnode.tag)
  // 2.处理vnode的props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        el.setAttribute(key, value)
      }
    }
  }
  // 3.处理children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(item => {
        mount(item, el)
      })
    }
  }

  // 4.挂载
  container.appendChild(el)
}
/**
 * 对新旧两个节点进行diff算法
 * @param oldVnode 旧节点
 * @param newVnode 新节点
 * @return {undefined}
 */
// eslint-disable-next-line no-unused-vars
const patch = (oldVnode, newVnode) => {
  // 如果节点的标签不同, 全部替换成新的节点
  if (oldVnode.tag !== newVnode.tag) {
    const parentElement = oldVnode.el.parentElement
    parentElement.removeChild(oldVnode.el)
    mount(newVnode, parentElement)
    return undefined
  }
  // 1. 节点标签相同, 在newVnode上保存el
  const el = newVnode.el = oldVnode.el
  // 2. 处理props
  const oldProps = oldVnode.props || {}
  const newProps = newVnode.props || {}
  // 2.1 先把newVnode的props全部替换到el中
  for (const key in newProps) {
    const oldValue = oldProps[key]
    const newValue = newProps[key]
    if (oldValue !== newValue) {
      // 只要不等开始替换
      if (key.startsWith('on')) {
        // 如果是事件
        el.removeEventListener(key.slice(2).toLowerCase(), oldValue)
        el.addEventListener(key.slice(2).toLowerCase(), newValue)
      } else {
        // 如果是普通属性
        el.setAttribute(key, newValue)
      }
    }
  }
  // 2.2 再把oldVnode的props多余的属性从el中去掉
  for (const key in oldProps) {
    if (!(key in newProps)) {
      // 如果是多余的属性
      if (key.startsWith('on')) {
        // 如果多余的属性是事件
        el.removeEventListener(key.slice(2).toLowerCase(), oldProps[key])
      } else {
        // 如果多余的属性是普通属性
        el.removeAttribute(key)
      }
    }
  }
  // 3. 处理children
  const oldChildren = oldVnode.children || []
  const newChildren = newVnode.children || []
  if (typeof newChildren === 'string') {
    // 如果新节点的children是string, 则直接去掉老节点, 替换成字符串
    el.innerHTML = newChildren
  } else {
    // 新节点的children是数组
    if (typeof oldChildren === 'string') {
      // 如果老节点的children是string
      el.innerHTML = ''
      newChildren.forEach(item => {
        mount(item, el)
      })
    } else {
      // 老节点的children也是数组
      // 数组对数组进行同等位置比较
      const commonLength = Math.min(oldChildren.length, newChildren.length)
      for (let i = 0; i < commonLength; i++) {
        patch(oldChildren[i], newChildren[i])
      }
      // 新节点的children更长, 直接追加渲染
      if (newChildren.length > oldChildren.length) {
        newChildren.slice(oldChildren.length).forEach(item => {
          mount(item, el)
        })
      }
      // 旧节点的children更长, 进行卸载操作
      if (newChildren.length < oldChildren.length) {
        oldChildren.slice(newChildren.length).forEach(item => {
          el.removeChild(item.el)
        })
      }
    }
  }
}
