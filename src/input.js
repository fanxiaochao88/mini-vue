// eslint-disable-next-line no-unused-vars
const createApp = (rootComponent) => {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldVnode = null
      // eslint-disable-next-line no-undef
      watchEffect(() => {
        if (!isMounted) {
          oldVnode = rootComponent.render()
          // eslint-disable-next-line no-undef
          mount(oldVnode, container)
          isMounted = true
        } else {
          const newVnode = rootComponent.render()
          // eslint-disable-next-line no-undef
          patch(oldVnode, newVnode)
          oldVnode = newVnode
        }
      })
    }
  }
}
