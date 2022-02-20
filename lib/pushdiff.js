import { getByPath, setByPath } from './jsonPointer.js'

const _expand = (value, translation) => {
  const match = value.match(/^({|\[)(.*)(}|])$/)
  if (match) {
    const [, prefix, root, suffix] = match
    if (prefix === '[') {
      return `[${JSON.parse(value)
        .map(n => PushDiff.translate(n, translation))
        .join(',')}]`
    } else if (prefix === '{') {
      return `{${JSON.parse(`[${root}]`)
        .map(n => PushDiff.translate(n, translation))
        .sort((a, b) => a - b)
        .join(',')}}`
    }
  }
  return value
}

const _setValueIndex = (diff, value, index) => {
  diff.indicesByValue.set(value, index)
  diff.valuesByIndex[index] = value
}

const _applyToDiff = (common, value, diff = common) => {
  if (common.indicesByValue.has(value)) return common.indicesByValue.get(value)
  if (!diff.indicesByValue.has(value)) {
    const nextIndex = Math.max(common.nextIndex, diff.nextIndex)
    _setValueIndex(diff, value, nextIndex)
    diff.nextIndex = nextIndex + 1
  }
  return diff.indicesByValue.get(value)
}

export class PushDiff {
  indicesByValue = new Map()
  valuesByIndex = []
  nextIndex = 2

  static translate (value, translation) {
    return translation.has(value) ? translation.get(value) : value
  }

  static applyDiff (target, diff) {
    const translation = new Map()
    diff.valuesByIndex.forEach((value, index) => {
      value = _expand(value, translation)
      const newIndex = _applyToDiff(target, value)
      if (index !== newIndex) translation.set(index, newIndex)
    })
    return translation
  }

  static translateDiff (translation, diff) {
    const result = new PushDiff()
    result.nextIndex = diff.nextIndex
    diff.valuesByIndex.forEach((value, index) => {
      value = _expand(value, translation)
      index = PushDiff.translate(index, translation)
      result.nextIndex = Math.max(result.nextIndex, index)
      _setValueIndex(result, value, index)
    })
    return result
  }

  static mergeDiffs (...diffs) {
    const mergedDiff = new PushDiff()
    diffs.forEach(diff => {
      diff.valuesByIndex.forEach((value, index) => {
        _setValueIndex(mergedDiff, value, index)
      })
    })
    mergedDiff.nextIndex = Math.max(...diffs.map(({ nextIndex }) => nextIndex))
    return mergedDiff
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

  fromIndex (index, diff = this) {
    if (index == undefined)
      index = diff.nextIndex === 2 ? -1 : diff.nextIndex - 1
    if (index === -1 || index == null) return null
    if (index <= 1) return index ? true : false
    let value = diff.valuesByIndex[index] || this.valuesByIndex[index]
    if (value !== undefined) {
      if (value[0] === '{') {
        value = `[${value.substring(1, value.length - 1)}]`
        return Object.fromEntries(JSON.parse(value).map(i => this.fromIndex(i)))
      } else if (value[0] === '[') {
        return JSON.parse(value).map(i => this.fromIndex(i, diff))
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
