export class PushDiff {
  constructor () {
    this.changes = []
    this.indicesByValue = new Map()
    this.valuesByIndex = []
    this.namedThings = new Map()
    this.toIndex(false)
    this.toIndex(true)
  }
  toIndex (value) {
    if (value === null) {
      return -1
    } else if (typeof value === 'object') {
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
    if (!this.indicesByValue.has(value)) {
      this.indicesByValue.set(value, this.valuesByIndex.length)
      this.valuesByIndex.push(value)
    }
    return this.indicesByValue.get(value)
  }
  fromIndex (index) {
    if (index === -1) {
      return null
    } else if (this.valuesByIndex[index] !== undefined) {
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
      console.error(`pushdiff can't find value for index`, index)
      throw new Error(`pushdiff can't find value for index`)
    }
  }
}

const pd = (window.pd = new PushDiff())
console.log(pd)
pd.toIndex('asdf')

const obj = {
  b: [1, 2],
  a: {
    d: 'asdf',
    c: true
  },
  e: null
}
console.log(pd.toIndex(obj))
console.log(pd.toIndex(obj))
const i = pd.toIndex(obj)
console.log(pd.fromIndex(i))
