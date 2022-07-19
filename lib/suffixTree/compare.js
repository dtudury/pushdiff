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