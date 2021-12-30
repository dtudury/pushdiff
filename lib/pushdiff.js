import { getByPath, setByPath } from './jsonPointer.js'

const _expand = (value, patch) => {
  const match = value.match(/^({|\[)(.*)(}|])$/)
  if (match) {
    const [, prefix, root, suffix] = match
    if (prefix === '[') {
      return `[${JSON.parse(value)
        .map(n => (patch.has(n) ? patch.get(n) : n))
        .join(',')}]`
    } else if (prefix === '{') {
      return `{${JSON.parse(`[${root}]`)
        .map(n => (patch.has(n) ? patch.get(n) : n))
        .sort((a, b) => a - b)
        .join(',')}}`
    }
  }
  return value
}

const _applyToDiff = (common, value, diff = common) => {
  if (common.indicesByValue.has(value)) return common.indicesByValue.get(value)
  if (!diff.indicesByValue.has(value)) {
    diff.indicesByValue.set(value, diff.nextIndex)
    diff.valuesByIndex[diff.nextIndex] = value
    ++diff.nextIndex
  }
  return diff.indicesByValue.get(value)
}

export class PushDiff {
  indicesByValue = new Map([])
  valuesByIndex = []
  nextIndex = 2

  rebase (diff) {
    const patch = new Map()
    diff.valuesByIndex.forEach((value, index) => {
      value = _expand(value, patch)
      const newIndex = _applyToDiff(this, value)
      if (index !== newIndex) patch.set(index, newIndex)
    })
    return patch
  }

  applyPatch (patch) {
    const diff = new PushDiff()
    this.valuesByIndex.forEach((value, index) => {
      value = _expand(value, patch)
      diff.nextIndex = patch.get(index)
      _applyToDiff(diff, value)
    })
    return diff
  }

  toIndex (value, diff = this) {
    if (value === null) return -1
    if (typeof value === 'boolean') return +value
    if (typeof value === 'object') {
      if (value.$pointer) {
        return value.$pointer
      }
      if (Array.isArray(value)) {
        value = `[${value
          .map(element => this.toIndex(element, diff))
          .join(',')}]`
      } else {
        value = `{${Object.entries(value)
          .map(entry => this.toIndex(entry, diff))
          .sort((a, b) => a - b)
          .join(',')}}`
      }
    } else if (['boolean', 'number', 'string'].includes(typeof value)) {
      value = JSON.stringify(value)
    } else {
      console.error(`pushdiff can't index value`, value)
      throw new Error(`pushdiff can't index value`)
    }
    return _applyToDiff(this, value, diff)
  }

  fromIndex (index) {
    if (index === -1 || index == null) return null
    if (index <= 1) return index ? true : false
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
