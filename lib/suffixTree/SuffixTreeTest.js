import {
  Concat,
  Basic,
  compare,
  Compressor,
  Head,
  Slice
} from './SuffixTree.js'

const compressor = new Compressor()
console.log(compressor.compress(new Basic('ca')))
console.log(compressor.compress(new Basic('b')))
console.log(compressor.compress(new Basic('c')))
console.log(compressor.compress(new Basic('abra')))
console.log(compressor.compress(new Basic('abraca')))
console.log(compressor.compress(new Basic('abracadabra')))
console.log(compressor.compress(new Basic('ca')))
console.log(compressor.compress(new Basic('ca')))
console.log(compressor.compress(new Basic('ca')))
console.log(compressor.compress(new Basic('ca')))
console.log(compressor.compress(new Basic('cadabra')))

'kilfjmaoghebdconp'
  .split('')
  .forEach((char) => compressor.compress(new Basic(char)))

console.log(compressor.toString())
