import { getByPath, setByPath } from './jsonPointer.js'
export class PushDiff {
  indicesByValue = new Map([
    ['false', 0],
    ['true', 1]
  ])
  valuesByIndex = ['false', 'true']

  applyPatch (startIndex, values, patch) {
    values.forEach((value, index) => {
      this.indicesByValue.delete(value)
      delete this.valuesByIndex[startIndex + index]
    })
    values.forEach((value, valueIndex) => {
      if (value === null) return -1
      const oldValue = value
      const oldIndex = startIndex + valueIndex
      const match = value.match(/^({|\[)(.*)(}|])$/)
      if (match) {
        const [, prefix, root, suffix] = match
        if (prefix && ['[', '{'].includes(prefix)) {
          value = `${prefix}${JSON.parse(`[${root}]`)
            .map(n => (patch.has(n) ? patch.get(n) : n))
            .join(',')}${suffix}`
        }
      }
      const index = patch.has(oldIndex) ? patch.get(oldIndex) : oldIndex
      this.indicesByValue.set(value, index)
      this.valuesByIndex[index] = value
    })
  }

  rebase (startIndex, values, patch = new Map()) {
    values.forEach((value, valueIndex) => {
      if (value === null) return -1
      const oldValue = value
      const index = startIndex + valueIndex
      const match = value.match(/^({|\[)(.*)(}|])$/)
      if (match) {
        const [, prefix, root, suffix] = match
        if (prefix && ['[', '{'].includes(prefix)) {
          value = `${prefix}${JSON.parse(`[${root}]`)
            .map(n => (patch.has(n) ? patch.get(n) : n))
            .join(',')}${suffix}`
        }
      }
      const newIndex = this._rawToIndex(value)
      patch.set(index, newIndex)
    })
    return patch
  }

  toIndex (value) {
    if (value === null) return -1
    if (typeof value === 'object') {
      if (value.$pointer) {
        return value.$pointer
      }
      if (Array.isArray(value)) {
        value = `[${value.map(element => this.toIndex(element)).join(',')}]`
      } else {
        value = `{${Object.entries(value)
          .map(entry => this.toIndex(entry))
          .sort((a, b) => a - b)
          .join(',')}}`
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
