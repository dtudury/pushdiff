import { Concat, Basic, compare, Compressor, Head, Slice } from './SuffixTree.js'


const abra = new Basic('abra')
const cadabra = new Basic('cadabra')
const abracadabra = new Concat(abra, cadabra)
console.log(abracadabra.toString())
console.log([...abracadabra.generator()].join(''))

const abraca = new Head(abracadabra, 6)
console.log(abraca.toString())
console.log([...abraca.generator()].join(''))

const dabra = new Slice(abracadabra, 6)
console.log(dabra.toString())
console.log([...dabra.generator()].join(''))

console.log(compare(abracadabra, abraca))

const compressor = new Compressor()
