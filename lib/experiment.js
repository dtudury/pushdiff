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
].forEach(value => {
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
