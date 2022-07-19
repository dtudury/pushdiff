import { Compressor } from './Compressor.js'

const compressor = new Compressor()

/*
const abracadabra = compressor.insert(compressor.createStringGeneratorFunction('abracadabra'))
const abra = compressor.insert(compressor.createHeadGeneratorFunction(abracadabra, 4))
const cadabra = compressor.insert(compressor.createTailGeneratorFunction(abracadabra, 4))
const _abracadabra = compressor.insert(compressor.createConcatGeneratorFunction(abra, cadabra))
*/

/*
const abc = compressor.insertString('abc')
const ab = compressor.insertString('ab')
const bc = compressor.insertString('bc')
const xyz = compressor.insertString('xyz')
const abcxyz = compressor.insertString('abcxyz')

const abracadabra = compressor.insertString('abracadabra')

// console.log(JSON.stringify({ abracadabra, abra, cadabra, _abracadabra }))

compressor.insertString('0123456789')
compressor.insertString('01234-6789')
compressor.insertString('asdf asdf asdf')
compressor.insertString('abc abc abc')
compressor.insertString('xyz abc xyz')
*/
// compressor.insertString('Grandma Jaibaji')
// compressor.insertString('Grandpa Jaibaji')
/*
const str = 'abracadabra'
for (let end = 1; end <= str.length; ++end) {
  compressor.insertString(str.substring(0, end))
}
*/
compressor.insertString('abra')
compressor.insertString('abracadabra')
compressor.insertString('cad') //whoops

console.log(compressor.toString())
