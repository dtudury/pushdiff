import { SortTreeNode } from './SortTreeNode.js'
import { compare } from './compare.js'

export class Compressor {
  constructor() {
    this.generatorFunctions = [this.createStringGeneratorFunction('')]
    this.root = new SortTreeNode(0)
  }

  compress = (generatorFunction) => {}

  lookup = (generatorFunction) => {
    let longestMatch = { length: 0 }
    return {
      ...this.root.walk((index) => {
        const comparison = compare(
          this.generatorFunctions[index],
          generatorFunction
        )
        if (comparison.length && longestMatch.length < comparison.length)
          longestMatch = { ...comparison, index }
        if (null === comparison.lower) return { direction: 0, comparison }
        if (generatorFunction === comparison.lower)
          return { direction: 1, comparison }
        else return { direction: -1, comparison }
      }),
      longestMatch
    }
  }

  insertString = (string) => {
    if (!string.length) return -1
    const generatorFunction = this.createStringGeneratorFunction(string)
    const index = this.generatorFunctions.length
    const { node, comparison, longestMatch } = this.lookup(generatorFunction)
    if (null === comparison.lower) return node.index // perfect match
    const isHigher = generatorFunction === comparison.lower
    if (!longestMatch.length) {
      // new letter
      const charIndex = this.insert(this.createCharGeneratorFunction(string[0]))
      if (string.length === 1) {
        return charIndex
      }
      return this.insertString(string)
    }
    if (!longestMatch.done) {
      longestMatch.index = this.insert(
        this.createHeadGeneratorFunction(
          longestMatch.index,
          longestMatch.length
        )
      )
    }
    const suffixIndex = this.insertString(string.slice(longestMatch.length))
    return this.insert(
      this.createConcatGeneratorFunction(longestMatch.index, suffixIndex)
    )
  }

  insert = (generatorFunction) => {
    const index = this.generatorFunctions.length
    if (!this.root) {
      this.generatorFunctions.push(generatorFunction)
      this.root = new SortTreeNode(index)
    } else {
      const { node, comparison } = this.lookup(generatorFunction)
      if (null === comparison.lower) {
        return node.index
      }
      this.generatorFunctions.push(generatorFunction)
      if (generatorFunction === comparison.lower) {
        node.higher = new SortTreeNode(index)
      } else {
        node.lower = new SortTreeNode(index)
      }
    }
    return index
  }

  createCharGeneratorFunction = (char) => {
    function* generator() {
      yield char
    }
    generator.toString = () => {
      return `'${char}'`
    }
    return generator
  }

  createStringGeneratorFunction = (string) => {
    function* generator() {
      for (let i = 0; i < string.length; ++i) {
        yield string.charAt(i)
      }
    }
    generator.toString = () => {
      return `"${string}"`
    }
    return generator
  }

  createConcatGeneratorFunction = (rootIndex, suffixIndex) => {
    const rootGeneratorFunction = this.generatorFunctions[rootIndex]
    const suffixGeneratorFunction = this.generatorFunctions[suffixIndex]
    function* generator() {
      let value, done
      const rootGenerator = rootGeneratorFunction()
      while ((({ value, done } = rootGenerator.next()), !done)) yield value
      if (suffixGeneratorFunction) {
        const suffixGenerator = suffixGeneratorFunction()
        while ((({ value, done } = suffixGenerator.next()), !done)) yield value
      }
    }
    generator.toString = () => {
      return `"${[...generator()].join('')}": (${rootIndex})+(${suffixIndex})`
    }
    return generator
  }

  createHeadGeneratorFunction = (rootIndex, length) => {
    const rootGeneratorFunction = this.generatorFunctions[rootIndex]
    function* generator() {
      let i = length
      let value, done
      const rootGenerator = rootGeneratorFunction()
      while ((({ value, done } = rootGenerator.next()), !done && i--))
        yield value
    }
    generator.toString = () => {
      return `"${[...generator()].join('')}": <H|${rootIndex}:${length}|H>`
    }
    return generator
  }

  createTailGeneratorFunction = (rootIndex, start) => {
    const rootGeneratorFunction = this.generatorFunctions[rootIndex]
    function* generator() {
      let i = start
      let value, done
      const rootGenerator = rootGeneratorFunction()
      while (i-- && !done) ({ done } = rootGenerator.next())
      while ((({ value, done } = rootGenerator.next()), !done)) yield value
    }
    generator.toString = () => {
      return `"${[...generator()].join('')}": <T|${rootIndex}:${start}|T>`
    }
    return generator
  }

  toString = () => {
    const nodeToString = (
      node,
      beforePrefix = '',
      prefix = '',
      afterPrefix = ''
    ) => {
      let outString = ''
      if (node.lower) {
        outString +=
          nodeToString(
            node.lower,
            `${beforePrefix}  `,
            `${beforePrefix} ╭`,
            `${beforePrefix} │`
          ) + '\n'
      }
      let intersection = '╾'
      if (node.lower && node.higher) intersection = '╉'
      else if (node.lower) intersection = '┹'
      else if (node.higher) intersection = '┱'
      outString += `${prefix}━${intersection}╴${JSON.stringify(node.index)}: ${
        this.generatorFunctions[node.index] &&
        this.generatorFunctions[node.index].toString()
      }`
      if (node.higher) {
        outString +=
          '\n' +
          nodeToString(
            node.higher,
            `${afterPrefix} │`,
            `${afterPrefix} ╰`,
            `${afterPrefix}  `
          )
      }
      return outString
    }
    return (
      this.generatorFunctions
        .map((string, index) => `${index}: ${string.toString()}`)
        .join('\n') +
      '\n' +
      nodeToString(this.root, '  ', '━━', '  ')
    )
  }
}
