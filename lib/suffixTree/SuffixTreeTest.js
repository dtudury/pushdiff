import { Appended, Basic, compare } from './SuffixTree.js'


const abra = new Basic('abra')
const cadabra = new Basic('cadabra')
const abracadabra = new Appended(abra, cadabra)
const g = abracadabra.generate()
console.log(abracadabra.toString())
console.log([...g].join(''))

console.log(compare(abracadabra.generate(), abra.generate()))
