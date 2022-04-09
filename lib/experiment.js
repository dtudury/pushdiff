import { ZipQL } from './ZipQL.js'

const roundTrip = (zql) => (uint8Array) => {
  const address = zql.smallUint8ArrayToAddress(uint8Array)
  const _uint8Array = zql.addressToSmallUint8Array(address)

  console.log(
    [...uint8Array].map((char) => char.toString(16)),
    '->',
    address.toString(16),
    '->',
    [..._uint8Array].map((char) => char.toString(16)),
    uint8Array.toString() === _uint8Array.toString() ? '👍' : '❌'
  )
}
;(() => {
  const zql = new ZipQL(21)
  ;[
    new Uint8Array([0]),
    new Uint8Array([1]),
    new Uint8Array([0xff]),
    new Uint8Array([0, 1]),
    new Uint8Array([0xff, 0xff]),
    new Uint8Array([0xff, 0xff, 0x1f]),
    // new Uint8Array([0, 0, 0x20]), // should throw

    new Uint8Array([0, 0]),
    new Uint8Array([1, 0]),
    new Uint8Array([0xff, 0]),
    new Uint8Array([0, 1, 0]),
    new Uint8Array([0xff, 0xff, 0]),

    new Uint8Array([0, 0, 0]),
    new Uint8Array([1, 0, 0]),
    new Uint8Array([0xff, 0, 0])
  ].forEach(roundTrip(zql))
})()
;(() => {
  const zql = new ZipQL()
  ;[new Uint8Array([1, 2, 3, 4])].forEach(roundTrip(zql))
})()

console.debug(process.memoryUsage())
