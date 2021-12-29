import { getByPath, setByPath } from './jsonPointer.js'
export class PushDiff {
  indicesByValue = new Map([
    ['false', 0],
    ['true', 1]
  ])
  valuesByIndex = ['false', 'true']
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

  rebase (startIndex, values) {
    const indexMap = new Map()
    let lastIndex
    values.map((value, valueIndex) => {
      if (value === null) return -1
      const index = startIndex + valueIndex
      const match = value.match(/^({|\[)(.*)(}|])$/)
      if (match) {
        const [, prefix, root, suffix] = match
        if (prefix && ['[', '{'].includes(prefix)) {
          value = `${prefix}${JSON.parse(`[${root}]`).map(n =>
            indexMap.has(n) ? indexMap.get(n) : n
          ).join(',')}${suffix}`
        }
      }
      lastIndex = this._rawToIndex(value)
      indexMap.set(index, lastIndex)
    })
    console.log(indexMap)
    return lastIndex
  }

  toIndex (value) {
    if (value === null) return -1
    if (typeof value === 'object') {
      if (value.$pointer) {
        return value.$pointer
      }
      if (Array.isArray(value)) {
        value = JSON.stringify(value.map(element => this.toIndex(element)))
      } else {
        value = JSON.stringify(
          Object.entries(value)
            .map(entry => this.toIndex(entry))
            .sort((a, b) => a - b)
        )
        value = `{${value.substring(1, value.length - 1)}}`
      }
    } else if (['boolean', 'number', 'string'].includes(typeof value)) {
      value = JSON.stringify(value)
    } else {
      console.error(`pushdiff can't index value`, value)
      throw new Error(`pushdiff can't index value`)
    }
    return this._rawToIndex(value)
  }

  _rawToIndex (value) {
    if (!this.indicesByValue.has(value)) {
      this.indicesByValue.set(value, this.valuesByIndex.length)
      this.valuesByIndex.push(value)
    }
    return this.indicesByValue.get(value)
  }

  fromIndex (index) {
    if (index === -1 || index == null) return null
    if (this.valuesByIndex[index] !== undefined) {
      let value = this.valuesByIndex[index]
      if (value[0] === '{') {
        value = `[${value.substring(1, value.length - 1)}]`
        return Object.fromEntries(JSON.parse(value).map(i => this.fromIndex(i)))
      } else if (value[0] === '[') {
        return JSON.parse(value).map(i => this.fromIndex(i))
      } else {
        return JSON.parse(value)
      }
      return value
    } else {
      console.error(`pushdiff can't evaluate index`, index)
      throw new Error(`pushdiff can't evaluate index`)
    }
  }
}
