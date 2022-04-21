export class Appended {
  constructor(root, suffix) {
    this.root = root
    this.suffix = suffix
  }
  *generate() {
    let value, done
    const rootGenerator = this.root.generate()
    while ((({ value, done } = rootGenerator.next()), !done)) yield value
    if (this.suffix) {
      const suffixGenerator = this.suffix.generate()
      while ((({ value, done } = suffixGenerator.next()), !done)) yield value
    }
  }
  toString() {
    return `(${this.root.toString()},${this.suffix.toString()})`
  }
}

export class Basic {
  constructor(string) {
    this.string = string
  }
  *generate() {
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

export function compare(aGenerator, bGenerator) {
  let aChar, aDone, bChar, bDone
  let result = { aChars: [], aDone: false, bChars: [], bDone: false }
  while (
    (({ value: aChar, done: aDone } = aGenerator.next()),
    ({ value: bChar, done: bDone } = bGenerator.next()),
    !aDone && !bDone)
  ) {
    result.aChars.push(aChar)
    result.bChars.push(bChar)
    if (aChar > bChar) return { ...result, ab: GREATER }
    if (aChar < bChar) return { ...result, ab: LESS }
  }
  result.aDone = aDone
  result.bDone = bDone
  if (aDone && bDone) return { ...result, ab: EQUAL }
  if (bDone) return { ...result, ab: LONGER }
  return { ...result, ab: SHORTER }
}

export class sortTreeNode {
  before = null
  after = null
  constructor(value) {
    this.value = value
  }
}

export class Compressor {
  root = new sortTreeNode()
  strings = []
  compress(string) {
    let basic = new Basic(string)
    let node = this.root
    let value
    while ((value = node.value)) {
      switch (compare(basic, this.strings[value])) {
        case LESS:
          if (!node.before) node.before = new sortTreeNode()
          node = node.before
        case SHORTER:
        case EQUAL:
          return value
        case LONGER:
        case GREATER:
          if (!node.after) node.after = new sortTreeNode()
          node = node.after
      }
    }
  }
}
