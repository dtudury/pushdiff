import { setByPath } from './jsonPointer.js'
export class PushDiff {
  #indicesByValue = new Map([
    ['false', 0],
    ['true', 1]
  ])
  #valuesByIndex = ['false', 'true']
  #index
  constructor () {
    this.#index = this.#toIndex({})
  }
  replace (path, value, message) {
    const namespace = this.#fromIndex(this.#index)
    const previous = namespace[path] || -1
    const next = this.#toIndex(value)
    setByPath(namespace, path, this.#toIndex({ previous, next, message }))
    this.#index = this.#toIndex(namespace)
    console.log(JSON.stringify(this.#fromIndex(this.#index), null, ' . '))
  }
  #toIndex (value) {
    if (value === null) {
      return -1
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        value = JSON.stringify(value.map(element => this.#toIndex(element)))
      } else {
        value = JSON.stringify(
          Object.entries(value)
            .map(entry => this.#toIndex(entry))
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
    if (!this.#indicesByValue.has(value)) {
      this.#indicesByValue.set(value, this.#valuesByIndex.length)
      this.#valuesByIndex.push(value)
    }
    return this.#indicesByValue.get(value)
  }
  #fromIndex (index) {
    if (index === -1) {
      return null
    } else if (this.#valuesByIndex[index] !== undefined) {
      let value = this.#valuesByIndex[index]
      if (value[0] === '{') {
        value = `[${value.substring(1, value.length - 1)}]`
        return Object.fromEntries(
          JSON.parse(value).map(i => this.#fromIndex(i))
        )
      } else if (value[0] === '[') {
        return JSON.parse(value).map(i => this.#fromIndex(i))
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

const pd = (window.pd = new PushDiff())
console.log(pd)

const m = {
  b: [1, 2],
  a: {
    d: 'asdf',
    c: true
  },
  e: null
}

pd.replace('/a/b/test', m, 'initial commit')
