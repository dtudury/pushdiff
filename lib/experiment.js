import { ZipQL } from './ZipQL.js'

const sb = new ZipQL()
;[
  11,
  22,
  33,
  'a',
  'b',
  'c',
  'abc',
  [44, 55, 66],
  [44, 55, 66],
  1,
  2,
  3,
  4,
  5,
  6,
  [1, 2, 3],
  [4, 5, 6],
  [1, 2, 3, 4, 5, 6]
].forEach((value) => {
  const json = JSON.stringify(value)
  const index = sb.index(value)
  console.log(json, '=>', index)
})
sb.valuesByIndex.forEach((value, index) => console.log(index, value))

const printNode = (node, indent = '  ') => {
  const index = sb.indicesByNode.get(node)
  if (!node) return 'undefined'
  if (!node.entries) return `bad node <${JSON.stringify(node)}>`
  return `${index}${[...node.entries()].map(
    ([key, value]) => `\n${indent}${key}: ${printNode(value, `  ${indent}`)}`
  )}`
}
console.log('indicesByNode:', printNode(sb.indicesByNode))

const buffer = new Uint8Array(16)
console.log(new Uint32Array([257]).buffer)
buffer.set(new Uint8Array(new Uint32Array([267]).buffer), 1)
console.log(buffer)

console.log(2 ** 31)

/**
 * @param {Uint8Array} uint8Array
 * @returns {number}
 */
const Uint8ArrayToUint32 = (uint8Array) => {
  if (!uint8Array.length) throw new Error('Uint8Array must have length > 0')
  if (uint8Array.length > 2) throw new Error('Uint8Array must have length <= 2') // for now
  if (uint8Array.length === 1) return uint8Array[0]
  let acc = 0
  uint8Array.forEach((char) => (acc = acc * 0x100 + char))
  acc += 0x100
  return acc
}

/**
 * @param {number} number
 * @returns {Uint8Array}
 */
const Uint32ToUint8Array = (number) => {
  if (number < 0) throw new Error('number must be >= 0')
  if (number < 0x100) return new Uint8Array([number])
  number -= 0x100
  if (number >= 0x10000) throw new Error('number must be < 0x10000')
  return new Uint8Array([number >>> 8, number & 0xff])
}

;[
  new Uint8Array([0]),
  new Uint8Array([1]),
  new Uint8Array([0, 0]),
  new Uint8Array([0, 1]),
  new Uint8Array([1, 0]),
  new Uint8Array([1, 1]),
  new Uint8Array([0xff, 0xff])
].forEach((value) => console.log(value, Uint8ArrayToUint32(value)))
;[
  0,
  1,
  256,
  257,
  512,
  513,
  65791
].forEach((value) => console.log(value, Uint32ToUint8Array(value)))
