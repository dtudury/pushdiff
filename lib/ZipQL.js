export class ZipQL {
  /** @private
   * @type {Map}
   */

  matchTree = new Map()
  partialMatchTree = new Map()
  suffixTree = new Map()
  indicesByNode = new Map()
  valuesByIndex = new Array(2)
  indicesByValue = new Map()

  /** @private @type [Uint8Array] */
  _index = 0
  pages = []
  hwm = 0

  constructor () {
    this.memory = new Uint8Array(0x10000);
  }

  /**
   * @private
   * @param {Uint8Array} buffer
   */
  _appendBuffer (buffer) {
    this.memory.set(buffer, this.hwm)
    this.hwm += buffer.length
  }

  /**
   * @private
   * @param {number} number
   */
  _appendNumber (number) {
    this.memory.set(new Uint32Array([number]), this.hwm)
    this.hwm += 4
  }

  /**
   *
   * @param {Uint8Array} buffer
   * @param {number} startAt
   * @returns {number}
   */
  happy (buffer, startAt) {
    const startingNumber = this.hwm
    this._appendNumber(buffer.length)

  }

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
