export class ZipQL {
  suffixTree = new Map()
  generatorTree = new Map()
  indicesByNode = new Map()
  valuesByIndex = new Array(2)
  indicesByValue = new Map()

  _store (value) {
    if (!this.indicesByValue.has(value)) {
      const index = this.valuesByIndex.length
      this.valuesByIndex[index] = value
      this.indicesByValue.set(value, index)
      return index
    }
    return this.indicesByNode.get(value)
  }
  index (value) {
    if (value === null) return -1
    let type = typeof value
    if (type === 'boolean') return +value
    if (type === 'object') {
      if (Array.isArray(value)) {
        type = 'array'
      } else {
        value = Object.entries(value).sort(([a], [b]) => (a > b ? 1 : -1))
      }
      if (!value.length) {
        return this._store(`${type[0]}|`)
      }
      let node = this.suffixTree
      let next
      while (value.length && node.has((next = this.index(value.pop())))) {
        node = node.get(next)
      }
      if (node === this.suffixTree) {
        console.log('+ adding new node:', next)

        node = new Map()
        this.suffixTree.set(next, node)
        this.indicesByNode.set(node, next)
      }
      const a = this.indicesByNode.get(node)
      console.log('---', value, next, JSON.stringify(a))
      if (!value.length) {
        return this._store(`${type[0]}|${a}`)
      }
      const b = this.index(value)
      if (!node.has(b)) {
        const child = new Map()
        node.set(b, child)
        this.indicesByNode.set(child, b)
      }
      return this._store(`${type[0]}|${a},${b}`)
    }
    return this._store(`${type[0]}|${value}`)
  }
}
