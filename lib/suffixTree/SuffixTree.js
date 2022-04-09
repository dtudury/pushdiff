class Node {
  constructor() {
    /** @type {Map<string,Node} */
    this.map = new Map()
  }

  /**
   * @param {string} indent
   * @param {string} tab
   */
  print = (indent = '', tab = '  ') => {
    ;[...this.map.entries()].forEach(([key, value], index, array) => {
      const marker = index < array.length - 1 ? '|' : ' '
      console.log(`${indent}*${key}`)
      value.print(`${indent}${marker}${tab}`, tab)
    })
  }
}

export class SuffixTree {
  root = new Node()

  /** @param {string} string */
  insert = (string) => {
    let node = this.root
    let depth = 0
    string.split('').forEach((char) => {
      if (!node.map.has(char)) {
        const child = new Node()
        node.map.set(char, child)
      }
      node = node.map.get(char)
      if (!this.root.map.has(char)) {
        this.root.map.set(char, node)
      }
    })
  }

  print = () => {
    this.root.print()
  }
}

export class ABTree {

  /**
   * @param {Uint8Array} uint8Array 
   */
  insert = (uint8Array) => {
    uint8Array.forEach(byte => {
      console.log(byte)
    })
  }
}
