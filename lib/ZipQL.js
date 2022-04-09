export class ZipQL {
  /**
   * @param {number} smallBits Size in bits of pre-prefix table keys
   * @param {number} addressSize Size in bytes of memory addresses
   * @param {number} pageSize Size in bytes of memory pages
   */
  constructor(smallBits = 12, addressSize = 4, pageSize = 0x100000) {
    /** @private */
    this.smallBits = smallBits
    /** @private */
    this.addressSize = addressSize
    /** @private */
    this.pageSize = pageSize
    /** @private */
    this.memory = new Uint8Array(pageSize)
    /** @private */
    this.smallMax = 2 ** smallBits - 1
    for (let i = 1; i < smallBits / 8; ++i) {
      this.smallMax += 0x100 ** i // 1 can be [1,0] OR [1]
    }
    /** @private */
    this.smallBytes = Math.ceil(this.smallBits / 8)
  }



  /**
   * @param {Uint8Array} uint8Array
   * @returns {number}
   */
  smallUint8ArrayToAddress = (uint8Array) => {
    if (!uint8Array.length) return -1
    let quartet = new Uint8Array(4)
    quartet.set(uint8Array)
    let number = new Uint32Array(quartet.buffer)[0]
    if (uint8Array.length <= this.smallBytes) {
      if (number < 2 ** this.smallBits) {
        let neededBytes = Math.ceil(Math.log(number + 1) / Math.log(0x100) || 1)
        let bits = this.smallBits
        for (
          let extraBytes = uint8Array.length - neededBytes;
          extraBytes > 0;
          --extraBytes
        ) {
          number += 2 ** bits
          bits = 8 * Math.floor((bits - 1) / 8)
        }
        return number
      }
    }
    return number
  }

  /**
   * @param {number} address
   * @returns {Uint8Array}
   */
  addressToSmallUint8Array = (address) => {
    if (address === -1) return new Uint8Array()
    if (address <= this.smallMax) {
      let usedBits = this.smallBits
      let padding = 0
      while (address >= 2 ** usedBits) {
        address -= 2 ** usedBits
        usedBits = 8 * Math.floor((usedBits - 1) / 8)
        ++padding
      }
      let bytes = Math.ceil(Math.log(address + 1) / Math.log(0x100) || 1)
      return new Uint8Array(new Uint32Array([address]).buffer).slice(
        0,
        bytes + padding
      )
    }
    return new Uint8Array()
  }

  read = (address) => {
    this.memory.
  }

  uint8ArrayToAddress = (uint8Array) => {
    const parts = read(0)
  }

  /**
   * @private
   * @param {Uint8Array} buffer
   */
  _appendBuffer(buffer) {
    this.memory.set(buffer, this.hwm)
    this.hwm += buffer.length
  }

  /**
   * @private
   * @param {number} number
   */
  _appendNumber(number) {
    this._appendBuffer(new Uint32Array([number]))
  }

  /**
   * @param {Uint8Array} buffer
   * @param {number} address
   * @returns {number}
   */
  happy(buffer, address) {
    const startingNumber = this.hwm
    this._appendNumber(buffer.length)
  }
}
