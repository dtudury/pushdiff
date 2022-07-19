import { Compressor } from './Compressor.js'

const compressor = new Compressor()

const abracadabra = compressor.createBasicGeneratorFunction('abracadabra')
const abra = compressor.createHeadGeneratorFunction(abracadabra, 4)
const cadabra = compressor.createTailGeneratorFunction(abracadabra, 4)
const _abracadabra = compressor.createConcatGeneratorFunction(abra, cadabra)

console.log(JSON.stringify({ abracadabra, abra, cadabra, _abracadabra }))

console.log(compressor.toString())

/*
printComparison(abracadabra, _abracadabra)
printComparison(_abracadabra, abracadabra)
printComparison(abra, cadabra)
printComparison(cadabra, abra)
printComparison(abra, abracadabra)
printComparison(abracadabra, abra)
*/
