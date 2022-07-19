import { compare } from "./stringGenerators.js"

export class SortTreeNode {
  before = null
  after = null
  constructor(value = null) {
    this.value = value
  }
  walk = (comparator) => {
    const comparison = comparator(this.value)
    if (comparison < 0) {
      if (this.before) return this.before.walk(comparator)
    } else if (comparison > 0) {
      if (this.after) return this.after.walk(comparator)
    }
    return { node: this, comparison }
  }
}

export class Compressor {
  root = new SortTreeNode()
  strings = []
  compress = (wordMachine, root = this.root) => {
    let node = root
    let longestMatch, chars, aChar, aDone, bChar, bDone, ab
    const comparator = (nextNode) => {
      if (nextNode.value === undefined) {
        node = nextNode
        return
      }
      ;({ chars, aChar, aDone, bChar, bDone, ab } = compare(
        wordMachine,
        this.strings[value]
      ))
    }
    root.walk(comparator)
    /*
    const walk = () => {
      while (node.value !== null) {
        ;({ chars, aChar, aDone, bChar, bDone, ab } = compare(
          string,
          this.strings[node.value]
        ))
        if (ab === EQUAL) {
          return node.value
        }
        if (chars.length) {
          if (!longestMatch || chars.length > longestMatch.chars.length) {
            longestMatch = { chars, done: bDone, index: node.value, node }
          }
        }
        if (ab === LESS || ab === SHORTER) {
          node.before = node.before || new SortTreeNode()
          node = node.before
        } else {
          node.after = node.after || new SortTreeNode()
          node = node.after
        }
      }
    }
    let match = walk()
    if (match) return match
    if (longestMatch) {
      if (ab === SHORTER) {
        node.value = this.strings.length
        this.strings.push(
          new Head(this.strings[longestMatch.index], longestMatch.chars.length)
        )
        return node.value
      }
      if (longestMatch.chars.length) {
        if (!longestMatch.done) {
          this.strings.push(
            new Head(
              this.strings[longestMatch.index],
              longestMatch.chars.length
            )
          )
        }
        match = walk()
        if (match) return match
        if (longestMatch.done) {
          const restIndex = this.compress(
            new Slice(string, longestMatch.chars.length)
          )
          walk()
          match = walk()
          if (match) return match
          console.log('restIndex', restIndex)
          node.value = this.strings.length
          console.log(this.toString())
          this.strings.push(
            new Concat(
              this.strings[longestMatch.index],
              this.strings[restIndex]
            )
          )
          return node.value
        }
      }
    }
    node.value = this.strings.length
    this.strings.push(new Basic([...string.generator()].join('')))
    return node.value
    */
  }
  toString = () => {
    const nodeToString = (
      node,
      beforePrefix = '',
      prefix = '',
      afterPrefix = ''
    ) => {
      let outString = ''
      if (node.before) {
        outString +=
          nodeToString(
            node.before,
            `${beforePrefix}  `,
            `${beforePrefix} ╭`,
            `${beforePrefix} │`
          ) + '\n'
      }
      let intersection = '╾'
      if (node.before && node.after) intersection = '╉'
      else if (node.before) intersection = '┹'
      else if (node.after) intersection = '┱'
      outString += `${prefix}━${intersection}╴${JSON.stringify(node.value)}: ${
        this.strings[node.value] && this.strings[node.value].toString()
      }`
      if (node.after) {
        outString +=
          '\n' +
          nodeToString(
            node.after,
            `${afterPrefix} │`,
            `${afterPrefix} ╰`,
            `${afterPrefix}  `
          )
      }
      return outString
    }
    return (
      this.strings
        .map((string, index) => `${index}: ${string.toString()}`)
        .join('\n') +
      '\n' +
      nodeToString(this.root, '  ', '━━', '  ')
    )
  }
}
