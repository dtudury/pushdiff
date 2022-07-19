const page = new Uint8Array(2**16)

const intToUint8 = int => new Uint8Array((new Uint32Array([int])).buffer)

/* addresses
   -----------------
   0x00000000-0x000000ff: single byte (last byte of address is byte represented)
   0x00000100-0x000100ff: two bytes (last two bytes of address are bytes represented)
   0x00010100-0xfffffffe: regular addresses (subtract 0x10100 * 21 bytes)
   0xffffffff: undefined (in the sense that it's a space for a value)
*/

const writeAt = (address, a, b, c, d, e, f) => {
  let i = (address - 0x10100) * 21
  page.set([a], i)
  ++i
  page.set(intToUint8(b), i)
  i += 4
  page.set(intToUint8(c), i)
  i += 4
  page.set(intToUint8(d), i)
  i += 4
  page.set(intToUint8(e), i)
  i += 4
  page.set(intToUint8(f), i)
}

const writeTermination = (address, source, length, shorter = 0, longer = 0, continuation = 0) => {

}

const writeContinuation = (address, prefix, suffix, before = 0, after = 0, termination = 0) => {

}

writeAt(0x10101, 1, 2, 3, 4, 5, 6)
console.log(page)

/*
  cde
  -dab
def
  -deg
  efg
 */
