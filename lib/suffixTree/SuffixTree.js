export class Concat {
  constructor(root, suffix) {
    this.root = root
    this.suffix = suffix
  }
  *generator() {
    let value, done
    const rootGenerator = this.root.generator()
    while ((({ value, done } = rootGenerator.next()), !done)) yield value
    if (this.suffix) {
      const suffixGenerator = this.suffix.generator()
      while ((({ value, done } = suffixGenerator.next()), !done)) yield value
    }
  }
  toString() {
    return `(${this.root.toString()}.${this.suffix.toString()})`
  }
}

export class Head {
  constructor(root, length) {
    this.root = root
    this.length = length
  }
  *generator() {
    let i = this.length
    let value, done
    const rootGenerator = this.root.generator()
    while ((({ value, done } = rootGenerator.next()), !done && i--)) yield value
  }
  toString() {
    return `<H|${this.root.toString()}:${this.length}|H>`
  }
}

export class Slice {
  constructor(root, start) {
    this.root = root
    this.start = start
  }
  *generator() {
    let i = this.start
    let value, done
    const rootGenerator = this.root.generator()
    while (i-- && !done) ({ done } = rootGenerator.next())
    while ((({ value, done } = rootGenerator.next()), !done)) yield value
  }
  toString() {
    return `<S|${this.root.toString()}:${this.start}|S>`
  }
}

export class Basic {
  constructor(string) {
    this.string = string
  }
  *generator() {
    for (let i = 0; i < this.string.length; ++i) {
      yield this.string.charAt(i)
    }
  }
  toString() {
    return `"${this.string}"`
  }
}

const LESS = 'LESS'
const SHORTER = 'SHORTER'
const EQUAL = 'EQUAL'
const LONGER = 'LONGER'
const GREATER = 'GREATER'

export function compare(a, b) {
  const aGenerator = a.generator()
  const bGenerator = b.generator()
  let aChar, aDone, bChar, bDone
  let result = { chars: [], aDone: false, bDone: false }
  while (
    (({ value: aChar, done: aDone } = aGenerator.next()),
    ({ value: bChar, done: bDone } = bGenerator.next()),
    !aDone && !bDone)
  ) {
    if (aChar === bChar) {
      result.chars.push(aChar)
    } else {
      result.aChar = aChar
      result.bChar = bChar
      if (aChar > bChar) return { ...result, ab: GREATER }
      return { ...result, ab: LESS }
    }
  }
  if (aChar && bChar) {
    console.log('***************', aChar, bChar)
  }
  result.aDone = aDone
  result.bDone = bDone
  if (aDone && bDone) return { ...result, ab: EQUAL }
  if (bDone) return { ...result, ab: LONGER }
  return { ...result, ab: SHORTER }
}

export class SortTreeNode {
  before = null
  after = null
  constructor(value = null) {
    this.value = value
  }
}

export class Compressor {
  root = new SortTreeNode()
  strings = []
  compress = (string, root = this.root) => {
    let node = root
    let longestMatch, chars, aChar, aDone, bChar, bDone, ab
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
    const match = walk()
    if (match) return match
    if (longestMatch) {
      if (ab === SHORTER) {
        node.value = this.strings.length
        this.strings.push(
          new Head(this.strings[longestMatch.index], chars.length)
        )
        return node.value
      }
      if (longestMatch.chars.length) {
        if (longestMatch.done) {
          const restIndex = this.compress(
            new Slice(string, longestMatch.chars.length)
          )
          walk()
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
    /*
    if (!longestMatch || !longestMatch.chars.length) {
      node.value = this.strings.length
      this.strings.push(new Basic(char))
      longestMatch = {
        chars: [char],
        done: true,
        index: node.value
      }
      node.after = new SortTreeNode()
      node = node.after
    }
    const prefixIndex = longestMatch.done
      ? longestMatch.index
      : this.compress(new Basic(longestMatch.chars.join('')))
    this.strings.push(node)
    */
  }
  toString = () => {
    const nodeToString = (
      node,
      prefix = '',
      beforePrefix = '',
      afterPrefix = ''
    ) => {
      let outString = ''
      if (node.before) {
        outString +=
          nodeToString(
            node.before,
            `${beforePrefix} ╭`,
            `${beforePrefix}  `,
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
            `${afterPrefix} ╰`,
            `${afterPrefix} │`,
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
      nodeToString(this.root, '━━', '  ', '  ')
    )
  }
}
