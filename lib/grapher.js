
  /*
  index
  constructor (init = {}) {
    this.index = this.toIndex(init)
  }
  get namespace() {
    return this.fromIndex(this.index)
  }
  replace (path, value, message = null) {
    const namespace = this.namespace
    let previousIndex = getByPath(namespace, path)
    if (previous == null) previousIndex = -1
    const previous = this.fromIndex(previousIndex)
    const parents = (previous && previous.parents) || []
    const children = new Set()
    const index = this.toIndex(value, children)
    console.log(children)
    setByPath(namespace, path, this.toIndex({ previous, index, message, children }))
    this.index = this.toIndex(namespace)
    return namespace
  }
  dereference (path) {
    const namespace = this.namespace
    let index = getByPath(namespace, path)
    if (index == null) index = -1
    const meta = this.fromIndex(index)
    return this.fromIndex((meta && meta.index) || -1)
  }
  */