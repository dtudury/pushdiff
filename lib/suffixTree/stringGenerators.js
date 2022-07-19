
export function compare(aGeneratorFunction, bGeneratorFunction) {
  const aGenerator = aGeneratorFunction()
  const bGenerator = bGeneratorFunction()
  let aChar, aDone, bChar, bDone
  let length = 0
  while (!aDone && !bDone) {
    const nextA = aGenerator.next()
    const nextB = bGenerator.next()
    aChar = nextA.value
    aDone = nextA.done
    bChar = nextB.value
    bDone = nextB.done
    if (aChar === bChar) {
      ++length
    } else {
      break
    }
  }
  if (aChar < bChar) return {lower: aGeneratorFunction, length, done: aDone}
  if (bChar < aChar) return {lower: bGeneratorFunction, length, done: bDone}
  if (aDone && bDone) return {lower: null, length, done: true}
  if (aDone) return {lower: aGeneratorFunction, length, done: true}
  return {lower: bGeneratorFunction, length, done: true}
}

export const createBasicGeneratorFunction = (string) => {
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

export const createConcatGeneratorFunction = (compressor, rootIndex, suffixIndex) => {
  const rootGeneratorFunction = compressor.generatorFunctions[rootIndex]
  const suffixGeneratorFunction = compressor.generatorFunctions[suffixIndex]
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

export const createHeadGeneratorFunction = (compressor, rootIndex, length) => {
  const rootGeneratorFunction = compressor.generatorFunctions[rootIndex]
  function* generator() {
    let i = length
    let value, done
    const rootGenerator = rootGeneratorFunction()
    while ((({ value, done } = rootGenerator.next()), !done && i--)) yield value
  }
  generator.toString = () => {
    return `"${[...generator()].join('')}": <H|${rootIndex}:${length}|H>`
  }
  return generator
}

export const createTailGeneratorFunction = (compressor, rootIndex, start) => {
  const rootGeneratorFunction = compressor.generatorFunctions[rootIndex]
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
